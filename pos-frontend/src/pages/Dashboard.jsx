import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div className="card">
        <h2>Welcome, {user?.full_name || user?.username}!</h2>
        <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
          Use the sidebar to navigate between modules. Start by creating a store, then add categories and products.
        </p>
      </div>
    </div>
  );
}
