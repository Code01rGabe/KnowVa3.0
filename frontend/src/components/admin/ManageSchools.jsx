import React, { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';

const emptyForm = {
  name: '',
  description: '',
  address: '',
  contactEmail: '',
  contactPhone: '',
};

const ManageSchools = () => {
  const [schools, setSchools] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSchools();
  }, [search, statusFilter, page]);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/management/schools', {
        params: { search, status: statusFilter, page },
      });
      setSchools(response.data.data || []);
      setMeta(response.data.meta || { totalPages: 1 });
    } catch (error) {
      console.error('Error loading schools:', error);
      setMessage(error.response?.data?.message || 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/admin/management/schools/${editingId}`, formData);
        setMessage('School updated successfully');
      } else {
        await api.post('/admin/management/schools', formData);
        setMessage('School created successfully');
      }
      setFormData(emptyForm);
      setEditingId(null);
      loadSchools();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save school');
    }
  };

  const handleEdit = (school) => {
    setEditingId(school._id);
    setFormData({
      name: school.name || '',
      description: school.description || '',
      address: school.address || '',
      contactEmail: school.contactEmail || '',
      contactPhone: school.contactPhone || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = async (schoolId, status) => {
    try {
      await api.post(`/admin/management/schools/${schoolId}/status`, { status });
      setMessage(`School ${status}`);
      loadSchools();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update status');
    }
  };

  const handleDelete = async (schoolId) => {
    if (!window.confirm('Delete this school? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/management/schools/${schoolId}`);
      setMessage('School deleted');
      loadSchools();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to delete school');
    }
  };

  const fetchAnalytics = async (schoolId) => {
    try {
      setAnalyticsLoading(true);
      const response = await api.get(`/admin/management/schools/${schoolId}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const statusBadge = (status) =>
    status === 'suspended' ? <span style={{ color: '#ff6b6b' }}>Suspended</span> : <span style={{ color: '#51cf66' }}>Active</span>;

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
          <p className="badge">Admin · Manage Schools</p>
          <h1>Schools Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create, update, suspend, or analyze every school on the platform.</p>
        </div>
      </div>

      {message && <div className={message.toLowerCase().includes('unable') ? 'error' : 'success'}>{message}</div>}

      <div className="card glass-card fade-up">
        <h2>{editingId ? 'Edit School' : 'Create New School'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>School Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Contact Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Contact Phone</label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" type="submit">
              {editingId ? 'Save Changes' : 'Create School'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn outline-button"
                onClick={() => {
                  setEditingId(null);
                  setFormData(emptyForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card glass-card fade-up">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '15px' }}>
          <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label>Search</label>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name" />
          </div>
          <div className="form-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : schools.length === 0 ? (
          <p>No schools match the current filters.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="list-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Representative</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr key={school._id}>
                    <td>{school.name}</td>
                    <td>{school.schoolCode}</td>
                    <td>{statusBadge(school.status)}</td>
                    <td>{school.schoolRepId ? school.schoolRepId.profile?.name || school.schoolRepId.email : 'Unassigned'}</td>
                    <td style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="btn outline-button" onClick={() => handleEdit(school)}>
                        Edit
                      </button>
                      <button
                        className="btn outline-button"
                        onClick={() => fetchAnalytics(school._id)}
                      >
                        View Stats
                      </button>
                      {school.status === 'active' ? (
                        <button className="btn outline-button" onClick={() => handleStatusChange(school._id, 'suspended')}>
                          Suspend
                        </button>
                      ) : (
                        <button className="btn outline-button" onClick={() => handleStatusChange(school._id, 'active')}>
                          Activate
                        </button>
                      )}
                      <button className="btn btn-danger" onClick={() => handleDelete(school._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{paginationButtons}</div>
      </div>

      {analytics && (
        <div className="card glass-card fade-up">
          <h2>School Analytics</h2>
          {analyticsLoading ? (
            <p>Loading analytics...</p>
          ) : (
            <>
              <p><strong>{analytics.school.name}</strong> ({analytics.school.schoolCode})</p>
              <div className="stats-grid">
                <div className="stats-card glass-card">
                  <h3>Teachers</h3>
                  <div className="value">{analytics.stats.teachers}</div>
                </div>
                <div className="stats-card glass-card">
                  <h3>Students</h3>
                  <div className="value">{analytics.stats.students}</div>
                </div>
                <div className="stats-card glass-card">
                  <h3>Courses</h3>
                  <div className="value">{analytics.stats.courses}</div>
                </div>
                <div className="stats-card glass-card">
                  <h3>Assignments</h3>
                  <div className="value">{analytics.stats.assignments}</div>
                </div>
                <div className="stats-card glass-card">
                  <h3>Pending Submissions</h3>
                  <div className="value">{analytics.stats.pendingSubmissions}</div>
                </div>
                <div className="stats-card glass-card">
                  <h3>Total Enrollments</h3>
                  <div className="value">{analytics.stats.totalEnrollments}</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageSchools;

