import React, { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordResets, setPasswordResets] = useState({});

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, statusFilter, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users', {
        params: {
          search,
          role: roleFilter,
          status: statusFilter,
          page,
        },
      });
      setUsers(response.data.data || []);
      setMeta(response.data.meta || { totalPages: 1 });
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage(error.response?.data?.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}`, { isActive: !user.isActive });
      setMessage(`User ${!user.isActive ? 'activated' : 'deactivated'}`);
      loadUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update user');
    }
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      await api.patch(`/admin/users/${user._id}`, { role: newRole });
      setMessage('Role updated');
      loadUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update role');
    }
  };

  const handlePasswordReset = async (userId) => {
    const newPassword = passwordResets[userId];
    if (!newPassword || newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    try {
      await api.post(`/admin/users/${userId}/reset-password`, { newPassword });
      setMessage('Password reset successfully');
      setPasswordResets((prev) => ({ ...prev, [userId]: '' }));
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to reset password');
    }
  };

  const paginationButtons = useMemo(() => {
    const buttons = [];
    for (let i = 1; i <= (meta.totalPages || 1); i += 1) {
      buttons.push(
        <button
          key={i}
          className="btn outline-button"
          style={{ padding: '6px 12px', fontSize: '13px', opacity: page === i ? 1 : 0.6 }}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }
    return buttons;
  }, [meta.totalPages, page]);

  return (
    <div className="container">
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <p className="badge">Admin · Manage Users</p>
          <h1>User Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View every user, update roles, toggle access, and reset passwords.</p>
        </div>
      </div>

      {message && <div className={message.toLowerCase().includes('unable') ? 'error' : 'success'}>{message}</div>}

      <div className="card glass-card fade-up">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '15px' }}>
          <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label>Search</label>
            <input placeholder="Name or email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="form-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
            <label>Role</label>
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="admin">Admin</option>
              <option value="schoolRep">School Rep</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="list-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>School</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.profile?.name || 'Unnamed'}</td>
                    <td>{user.email}</td>
                    <td>
                      <select value={user.role} onChange={(e) => handleRoleChange(user, e.target.value)}>
                        <option value="admin">Admin</option>
                        <option value="schoolRep">School Rep</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                      </select>
                    </td>
                    <td>
                      <button className="btn outline-button" onClick={() => handleStatusToggle(user)}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>{user.schoolId?.name || '—'}</td>
                    <td style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          style={{ flex: 1 }}
                          type="password"
                          placeholder="New password"
                          value={passwordResets[user._id] || ''}
                          onChange={(e) => setPasswordResets((prev) => ({ ...prev, [user._id]: e.target.value }))}
                        />
                        <button className="btn outline-button" onClick={() => handlePasswordReset(user._id)}>
                          Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{paginationButtons}</div>
      </div>
    </div>
  );
};

export default ManageUsers;

