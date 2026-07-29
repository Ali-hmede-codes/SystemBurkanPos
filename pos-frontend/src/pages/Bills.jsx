import { useState, useEffect } from 'react';
import { billService, storeService } from '../services/endpoints';
import toast from 'react-hot-toast';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [stores, setStores] = useState([]);
  const [filterStore, setFilterStore] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewBill, setViewBill] = useState(null);

  useEffect(() => { loadStores(); }, []);
  useEffect(() => { loadBills(); }, [filterStore, filterStatus]);

  const loadStores = async () => {
    try { const res = await storeService.getAll(); setStores(res.data.data); } catch {}
  };

  const loadBills = async () => {
    try {
      const res = await billService.getAll(filterStore || undefined, filterStatus || undefined);
      setBills(res.data.data);
    } catch { toast.error('Failed to load bills'); }
  };

  const handleView = async (id) => {
    try { const res = await billService.getById(id); setViewBill(res.data.data); }
    catch { toast.error('Failed to load bill details'); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await billService.updateStatus(id, newStatus);
      toast.success('Status updated');
      loadBills();
      if (viewBill?.id === id) handleView(id);
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bill permanently?')) return;
    try { await billService.delete(id); toast.success('Deleted'); loadBills(); setViewBill(null); }
    catch { toast.error('Failed to delete'); }
  };

  const statusBadge = (status) => {
    const map = { draft: 'badge-info', confirmed: 'badge-warning', delivered: 'badge-success', cancelled: 'badge-danger' };
    return <span className={`badge ${map[status] || ''}`}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Bills</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select value={filterStore} onChange={(e) => setFilterStore(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Stores</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="card">
        {bills.length === 0 ? (
          <div className="empty-state">No bills found.</div>
        ) : (
          <table>
            <thead><tr><th>#</th><th>Store</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.store_name}</td>
                  <td><strong>{b.customer_name}</strong></td>
                  <td>{Number(b.total).toFixed(2)}</td>
                  <td>{statusBadge(b.status)}</td>
                  <td>{new Date(b.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-primary" style={{ marginRight: '0.5rem' }} onClick={() => handleView(b.id)}>View</button>
                    <button className="btn-danger" onClick={() => handleDelete(b.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {viewBill && (
        <div className="modal-overlay" onClick={() => setViewBill(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h2>Bill #{viewBill.id}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div><small style={{ color: 'var(--text-light)' }}>Store</small><br /><strong>{viewBill.store_name}</strong></div>
              <div><small style={{ color: 'var(--text-light)' }}>Status</small><br />{statusBadge(viewBill.status)}</div>
              <div><small style={{ color: 'var(--text-light)' }}>Customer</small><br /><strong>{viewBill.customer_name}</strong></div>
              <div><small style={{ color: 'var(--text-light)' }}>Phone</small><br />{viewBill.customer_phone || '-'}</div>
              <div style={{ gridColumn: '1 / -1' }}><small style={{ color: 'var(--text-light)' }}>Address</small><br />{viewBill.customer_address || '-'}</div>
            </div>

            <table>
              <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead>
              <tbody>
                {viewBill.items?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{Number(item.product_price).toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>{Number(item.line_total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <div>Subtotal: <strong>{Number(viewBill.subtotal).toFixed(2)}</strong></div>
              <div>Delivery: <strong>{Number(viewBill.delivery_cost).toFixed(2)}</strong></div>
              <div style={{ fontSize: '1.2rem', marginTop: '0.25rem' }}>Total: <strong>{Number(viewBill.total).toFixed(2)}</strong></div>
            </div>

            {viewBill.notes && <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'var(--bg)', borderRadius: '6px' }}><small>Notes: {viewBill.notes}</small></div>}

            <div className="modal-actions">
              {viewBill.status === 'draft' && <button className="btn-success" onClick={() => handleStatusChange(viewBill.id, 'confirmed')}>Confirm</button>}
              {viewBill.status === 'confirmed' && <button className="btn-success" onClick={() => handleStatusChange(viewBill.id, 'delivered')}>Mark Delivered</button>}
              {viewBill.status !== 'cancelled' && viewBill.status !== 'delivered' && <button className="btn-danger" onClick={() => handleStatusChange(viewBill.id, 'cancelled')}>Cancel</button>}
              <button className="btn-secondary" onClick={() => setViewBill(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
