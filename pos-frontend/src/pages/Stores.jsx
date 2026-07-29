import { useState, useEffect } from 'react';
import { storeService } from '../services/endpoints';
import toast from 'react-hot-toast';

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', phone_number: '' });

  useEffect(() => { loadStores(); }, []);

  const loadStores = async () => {
    try {
      const res = await storeService.getAll();
      setStores(res.data.data);
    } catch { toast.error('Failed to load stores'); }
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', location: '', phone_number: '' }); setShowModal(true); };
  const openEdit = (store) => { setEditing(store); setForm({ name: store.name, location: store.location || '', phone_number: store.phone_number || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Store name is required');
    try {
      if (editing) {
        await storeService.update(editing.id, form);
        toast.success('Store updated');
      } else {
        await storeService.create(form);
        toast.success('Store created');
      }
      setShowModal(false);
      loadStores();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this store? This will also delete its categories, products and bills.')) return;
    try {
      await storeService.delete(id);
      toast.success('Store deleted');
      loadStores();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Stores</h1>
        <button className="btn-primary" onClick={openCreate}>+ Add Store</button>
      </div>
      <div className="card">
        {stores.length === 0 ? (
          <div className="empty-state">No stores yet. Create your first store.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Name</th><th>Location</th><th>Phone</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.location || '-'}</td>
                  <td>{s.phone_number || '-'}</td>
                  <td>
                    <button className="btn-primary" style={{ marginRight: '0.5rem' }} onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
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
            <h2>{editing ? 'Edit Store' : 'New Store'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Store Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Store name" />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Address / location" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="Phone number" />
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
