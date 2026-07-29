import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { statsService } from '../services/endpoints';
import toast from 'react-hot-toast';
import './Dashboard.css';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard() {
  const { user } = useAuth();
  const [today, setToday] = useState(null);
  const [byStatus, setByStatus] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => { loadToday(); }, []);
  useEffect(() => { loadMonthly(); }, [year]);

  const loadToday = async () => {
    try {
      const res = await statsService.getToday();
      setToday(res.data.data.today);
      setByStatus(res.data.data.by_status);
    } catch { toast.error('Failed to load today stats'); }
  };

  const loadMonthly = async () => {
    try {
      const res = await statsService.getMonthly(year);
      setMonthly(res.data.data);
    } catch { toast.error('Failed to load monthly stats'); }
  };

  const totalYearRevenue = monthly.reduce((sum, m) => sum + parseFloat(m.total_revenue), 0);
  const totalYearBills = monthly.reduce((sum, m) => sum + parseInt(m.total_bills), 0);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span style={{ color: 'var(--text-light)' }}>Welcome, {user?.full_name || user?.username}</span>
      </div>

      {/* Today's Summary */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-label">Today's Revenue</div>
          <div className="stat-value">{today ? Number(today.total_revenue).toFixed(2) : '0.00'}</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-label">Today's Bills</div>
          <div className="stat-value">{today?.total_bills || 0}</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-label">Products Revenue</div>
          <div className="stat-value">{today ? Number(today.total_products_revenue).toFixed(2) : '0.00'}</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-label">Delivery Collected</div>
          <div className="stat-value">{today ? Number(today.total_delivery).toFixed(2) : '0.00'}</div>
        </div>
      </div>

      {/* Today by status */}
      {byStatus.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Today's Bills by Status</h3>
          <div className="status-row">
            {byStatus.map((s) => (
              <div key={s.status} className="status-item">
                <span className={`badge badge-${s.status === 'draft' ? 'info' : s.status === 'confirmed' ? 'warning' : s.status === 'delivered' ? 'success' : 'danger'}`}>{s.status}</span>
                <strong>{s.count}</strong>
                <small>{Number(s.total).toFixed(2)}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly breakdown */}
      <div className="card">
        <div className="monthly-header">
          <h3>Monthly Revenue</h3>
          <div className="year-selector">
            <button onClick={() => setYear(year - 1)}>&lt;</button>
            <span>{year}</span>
            <button onClick={() => setYear(year + 1)}>&gt;</button>
          </div>
        </div>

        <div className="year-summary">
          <span>Year Total: <strong>{totalYearRevenue.toFixed(2)}</strong></span>
          <span>Total Bills: <strong>{totalYearBills}</strong></span>
        </div>

        {monthly.length === 0 ? (
          <div className="empty-state">No data for {year}</div>
        ) : (
          <table>
            <thead>
              <tr><th>Month</th><th>Bills</th><th>Products</th><th>Delivery</th><th>Total Revenue</th></tr>
            </thead>
            <tbody>
              {monthly.map((m) => (
                <tr key={m.month}>
                  <td><strong>{MONTH_NAMES[m.month - 1]} {m.year}</strong></td>
                  <td>{m.total_bills}</td>
                  <td>{Number(m.total_products_revenue).toFixed(2)}</td>
                  <td>{Number(m.total_delivery).toFixed(2)}</td>
                  <td><strong>{Number(m.total_revenue).toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
