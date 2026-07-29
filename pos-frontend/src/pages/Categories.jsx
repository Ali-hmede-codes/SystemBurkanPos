import { useState, useEffect } from 'react';
import { categoryService, storeService } from '../services/endpoints';
import toast from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [filterStore, setFilterStore] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ store_id: '', name: '', description: '' });

  useEffect(() => { loadStores(); }, []);
  useEffect(() => { loadCategories(); }, [filterStore]);

  const loadStores = async () => {
    try { const res = await storeService.getAll(); setStores(res.data.data); } catch {}
  };

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAll(filterStore || undefined);
      setCategories(res.data.data);
    } catch { toast.error('Failed to load categories'); }
  };

  const openCreate = () => { setEditing(null); setForm({ store_id: stores[0]?.id || '', name: '', description: '' }); setShowModal(true); };
  const openEdit = (cat) => { setEditing(cat); setForm({ store_id: cat.store_id, name: cat.name, description: cat.description || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.store_id || !form.name) return toast.error('Store and name are required');
    try {
      if (editing) {
        await categoryService.update(editing.id, form);
        toast.success('Category updated');
      } else {
        await categoryService.create(form);
        toast.success('Category created');
      }
      setShowModal(false);
      loadCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await categoryService.delete(id); toast.success('Deleted'); loadCategories(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Categories</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select value={filterStore} onChange={(e) => setFilterStore(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Stores</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="btn-primary" onClick={openCreate}>+ Add Category</button>
        </div>
      </div>
      <div className="card">
        {categories.length === 0 ? (
          <div className="empty-state">No categories found.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Store</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.store_name}</td>
                  <td>{c.description || '-'}</td>
                  <td>
                    <button className="btn-primary" style={{ marginRight: '0.5rem' }} onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
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
            <h2>{editing ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Store *</label>
                <select value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })}>
                  <option value="">Select store</option>
                  {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Category Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" />
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
