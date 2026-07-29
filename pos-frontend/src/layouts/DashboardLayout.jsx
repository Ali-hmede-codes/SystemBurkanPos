import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { FiHome, FiShoppingBag, FiGrid, FiBox, FiFileText, FiUsers, FiLogOut, FiShoppingCart, FiMenu, FiX, FiSettings } from 'react-icons/fi';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { to: '/dashboard', icon: <FiHome />, label: t.dashboard, end: true },
    { to: '/pos', icon: <FiShoppingCart />, label: t.pos },
    { to: '/bills', icon: <FiFileText />, label: t.bills },
    { to: '/stores', icon: <FiShoppingBag />, label: t.stores },
    { to: '/categories', icon: <FiGrid />, label: t.categories },
    { to: '/products', icon: <FiBox />, label: t.products },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/users', icon: <FiUsers />, label: t.users });
  }

  navItems.push({ to: '/settings', icon: <FiSettings />, label: t.settings });

  return (
    <div className="dashboard">
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>{t.appName}</h2>
          <button className="sidebar-close" onClick={closeSidebar}><FiX /></button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
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
        <div className="mobile-header">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}><FiMenu /></button>
          <span>{t.appName}</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
