import { useState, useEffect } from 'react';
import { productService, storeService, categoryService } from '../services/endpoints';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterStore, setFilterStore] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ store_id: '', category_id: '', name: '', price: '', description: '', sku: '' });

  useEffect(() => { loadStores(); }, []);
  useEffect(() => { loadProducts(); }, [filterStore]);

  const loadStores = async () => {
    try { const res = await storeService.getAll(); setStores(res.data.data); } catch {}
  };

  const loadProducts = async () => {
    try {
      const res = await productService.getAll(filterStore || undefined);
      setProducts(res.data.data);
    } catch { toast.error('Failed to load products'); }
  };

  const loadCategories = async (storeId) => {
    if (!storeId) { setCategories([]); return; }
    try { const res = await categoryService.getByStore(storeId); setCategories(res.data.data); } catch {}
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ store_id: stores[0]?.id || '', category_id: '', name: '', price: '', description: '', sku: '' });
    if (stores[0]) loadCategories(stores[0].id);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ store_id: p.store_id, category_id: p.category_id || '', name: p.name, price: p.price, description: p.description || '', sku: p.sku || '' });
    loadCategories(p.store_id);
    setShowModal(true);
  };

  const handleStoreChange = (storeId) => {
    setForm({ ...form, store_id: storeId, category_id: '' });
    loadCategories(storeId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.store_id || !form.name || !form.price) return toast.error('Store, name and price are required');
    try {
      const data = { ...form, price: parseFloat(form.price) };
      if (editing) {
        await productService.update(editing.id, { ...data, is_active: editing.is_active });
        toast.success('Product updated');
      } else {
        await productService.create(data);
        toast.success('Product created');
      }
      setShowModal(false);
      loadProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await productService.delete(id); toast.success('Deleted'); loadProducts(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select value={filterStore} onChange={(e) => setFilterStore(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Stores</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="btn-primary" onClick={openCreate}>+ Add Product</button>
        </div>
      </div>
      <div className="card">
        {products.length === 0 ? (
          <div className="empty-state">No products found.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Store</th><th>Category</th><th>Price</th><th>SKU</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.store_name}</td>
                  <td>{p.category_name || '-'}</td>
                  <td>{Number(p.price).toFixed(2)}</td>
                  <td>{p.sku || '-'}</td>
                  <td>
                    <button className="btn-primary" style={{ marginRight: '0.5rem' }} onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Store *</label>
                  <select value={form.store_id} onChange={(e) => handleStoreChange(e.target.value)}>
                    <option value="">Select store</option>
                    {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">No category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Product Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Optional SKU" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
