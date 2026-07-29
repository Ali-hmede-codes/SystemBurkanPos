import { useState, useEffect } from 'react';
import { userService } from '../services/endpoints';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'cashier' });
  const [resetPw, setResetPw] = useState({ show: false, userId: null, password: '' });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try { const res = await userService.getAll(); setUsers(res.data.data); }
    catch { toast.error('Failed to load users'); }
  };

  const openCreate = () => { setEditing(null); setForm({ username: '', password: '', full_name: '', role: 'cashier' }); setShowModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ username: u.username, password: '', full_name: u.full_name, role: u.role }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.full_name) return toast.error('Username and full name are required');
    if (!editing && !form.password) return toast.error('Password is required');
    try {
      if (editing) {
        await userService.update(editing.id, { username: form.username, full_name: form.full_name, role: form.role, is_active: editing.is_active });
        toast.success('User updated');
      } else {
        await userService.create(form);
        toast.success('User created');
      }
      setShowModal(false);
      loadUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await userService.delete(id); toast.success('Deleted'); loadUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleToggleActive = async (user) => {
    try {
      await userService.update(user.id, { username: user.username, full_name: user.full_name, role: user.role, is_active: !user.is_active });
      toast.success(user.is_active ? 'User disabled' : 'User enabled');
      loadUsers();
    } catch { toast.error('Failed to update'); }
  };

  const handleResetPassword = async () => {
    if (!resetPw.password || resetPw.password.length < 6) return toast.error('Min 6 characters');
    try {
      await userService.resetPassword(resetPw.userId, { new_password: resetPw.password });
      toast.success('Password reset');
      setResetPw({ show: false, userId: null, password: '' });
    } catch { toast.error('Failed to reset password'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Users Management</h1>
        <button className="btn-primary" onClick={openCreate}>+ Add User</button>
      </div>
      <div className="card">
        {users.length === 0 ? (
          <div className="empty-state">No users found.</div>
        ) : (
          <table>
            <thead><tr><th>Username</th><th>Full Name</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.full_name}</td>
                  <td><span className="badge badge-info">{u.role}</span></td>
                  <td>{u.is_active ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Disabled</span>}</td>
                  <td>
                    <button className="btn-primary" style={{ marginRight: '0.25rem' }} onClick={() => openEdit(u)}>Edit</button>
                    <button className="btn-secondary" style={{ marginRight: '0.25rem' }} onClick={() => setResetPw({ show: true, userId: u.id, password: '' })}>Reset PW</button>
                    <button className={u.is_active ? 'btn-secondary' : 'btn-success'} style={{ marginRight: '0.25rem' }} onClick={() => handleToggleActive(u)}>{u.is_active ? 'Disable' : 'Enable'}</button>
                    <button className="btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
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
            <h2>{editing ? 'Edit User' : 'New User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username *</label>
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username (min 3 chars)" />
              </div>
              {!editing && (
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
                </div>
              )}
              <div className="form-group">
                <label>Full Name *</label>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resetPw.show && (
        <div className="modal-overlay" onClick={() => setResetPw({ show: false, userId: null, password: '' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Reset Password</h2>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={resetPw.password} onChange={(e) => setResetPw({ ...resetPw, password: e.target.value })} placeholder="Min 6 characters" />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setResetPw({ show: false, userId: null, password: '' })}>Cancel</button>
              <button className="btn-primary" onClick={handleResetPassword}>Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
