import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiShoppingBag, FiGrid, FiBox, FiFileText, FiUsers, FiLogOut, FiShoppingCart } from 'react-icons/fi';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard', end: true },
    { to: '/pos', icon: <FiShoppingCart />, label: 'POS (New Bill)' },
    { to: '/bills', icon: <FiFileText />, label: 'Bills' },
    { to: '/stores', icon: <FiShoppingBag />, label: 'Stores' },
    { to: '/categories', icon: <FiGrid />, label: 'Categories' },
    { to: '/products', icon: <FiBox />, label: 'Products' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/users', icon: <FiUsers />, label: 'Users' });
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>POS System</h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <strong>{user?.full_name || user?.username}</strong>
            <small>{user?.role}</small>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <FiLogOut />
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
