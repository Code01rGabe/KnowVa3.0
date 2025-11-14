import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const actionCards = [
  { title: 'Manage Schools', subtitle: 'Create, edit, suspend, or analyze', target: '/admin/schools' },
  { title: 'Manage Users', subtitle: 'Search, filter, reset passwords, assign roles', target: '/admin/users' },
  { title: 'System Settings', subtitle: 'Branding, maintenance, feature toggles', target: '#system-settings' },
  { title: 'Security Center', subtitle: 'Audit logs, login history, permissions', target: '#security-center' },
  { title: 'Announcements', subtitle: 'Send platform-wide messages', target: '#announcements' },
  { title: 'Subscriptions & Billing', subtitle: 'Plans, payments, usage', target: '#billing' },
  { title: 'Support Desk', subtitle: 'Tickets, assignments, status tracking', target: '#support' },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [schoolsPreview, setSchoolsPreview] = useState([]);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({
    submissions: true,
    messaging: true,
    analytics: true,
  });
  const [branding, setBranding] = useState({
    platformName: 'KnowVa Learning',
    primaryColor: '#ff6600',
  });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    audience: 'all',
  });
  const [announcementStatus, setAnnouncementStatus] = useState('');

  useEffect(() => {
    loadStats();
    loadPreviewSchools();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadPreviewSchools = async () => {
    try {
      const response = await api.get('/admin/management/schools', { params: { limit: 5 } });
      setSchoolsPreview(response.data.data || []);
    } catch (error) {
      console.error('Error previewing schools:', error);
    }
  };

  const handleToggleFeature = (key) => {
    setFeatureFlags((prev) => ({ ...prev, [key]: !prev[key] }));
    setSettingsMessage('Feature toggles saved (mock).');
  };

  const handleAnnouncementSend = (e) => {
    e.preventDefault();
    setAnnouncementStatus('Announcement queued for delivery (mock).');
    setNewAnnouncement({ title: '', message: '', audience: 'all' });
  };

  const statCards = stats?.stats
    ? [
        { label: 'Schools', value: stats.stats.totalSchools },
        { label: 'Active Schools', value: stats.stats.activeSchools },
        { label: 'Users', value: stats.stats.totalUsers },
        { label: 'Teachers', value: stats.stats.teachers },
        { label: 'Students', value: stats.stats.students },
        { label: 'Courses', value: stats.stats.totalCourses },
        { label: 'Assignments', value: stats.stats.totalAssignments },
        { label: 'Pending Submissions', value: stats.stats.pendingSubmissions },
        { label: 'Avg Students/Course', value: stats.stats.avgStudentsPerCourse },
      ]
    : [];

  return (
    <div className="container">
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <p className="badge">Super Admin</p>
          <h1>Platform Command Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Oversee every school, user, and system feature from one pane of glass.</p>
        </div>
        <button className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={card.label} className={`stats-card glass-card delay-${index % 3}`}>
            <h3>{card.label}</h3>
            <div className="value">{card.value ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="features-grid" style={{ marginTop: 30 }}>
        {actionCards.map((card) => (
          <div key={card.title} className="feature-card">
            <h3>{card.title}</h3>
            <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{card.subtitle}</p>
            {card.target.startsWith('/admin') ? (
              <button className="btn outline-button" style={{ marginTop: 12 }} onClick={() => navigate(card.target)}>
                Open
              </button>
            ) : (
              <a className="btn outline-button" style={{ marginTop: 12 }} href={card.target}>
                Go
              </a>
            )}
          </div>
        ))}
      </div>

      <div id="system-settings" className="card glass-card fade-up" style={{ marginTop: 40 }}>
        <h2>System Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          UI demo — wire these controls to the platform settings service to persist branding, maintenance mode, and feature flags.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div>
            <label className="form-group">
              <span>Platform Name</span>
              <input
                type="text"
                value={branding.platformName}
                onChange={(e) => setBranding((prev) => ({ ...prev, platformName: e.target.value }))}
              />
            </label>
            <label className="form-group">
              <span>Primary Color</span>
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => setBranding((prev) => ({ ...prev, primaryColor: e.target.value }))}
              />
            </label>
            <label className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="checkbox" checked={maintenanceMode} onChange={() => setMaintenanceMode((prev) => !prev)} />
              Maintenance Mode
            </label>
          </div>
          <div>
            <p style={{ fontWeight: 600 }}>Feature Toggles</p>
            {Object.keys(featureFlags).map((flag) => (
              <label key={flag} className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" checked={featureFlags[flag]} onChange={() => handleToggleFeature(flag)} />
                {flag.charAt(0).toUpperCase() + flag.slice(1)}
              </label>
            ))}
            {settingsMessage && <p className="success">{settingsMessage}</p>}
          </div>
        </div>
      </div>

      <div id="announcements" className="card glass-card fade-up" style={{ marginTop: 30 }}>
        <h2>Global Announcements</h2>
        <form onSubmit={handleAnnouncementSend}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea
              value={newAnnouncement.message}
              onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, message: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Audience</label>
            <select
              value={newAnnouncement.audience}
              onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, audience: e.target.value }))}
            >
              <option value="all">All Schools</option>
              <option value="teachers">Teachers</option>
              <option value="students">Students</option>
            </select>
          </div>
          {announcementStatus && <div className="success">{announcementStatus}</div>}
          <button className="btn btn-primary" type="submit">
            Send Announcement
          </button>
        </form>
      </div>

      <div className="card glass-card fade-up" style={{ marginTop: 30 }}>
        <h2>Most Active Schools</h2>
        {schoolsPreview.length === 0 ? (
          <p>No schools yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="list-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Representative</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schoolsPreview.map((school) => (
                  <tr key={school._id}>
                    <td>{school.name}</td>
                    <td>{school.schoolCode}</td>
                    <td>{school.schoolRepId ? school.schoolRepId.profile?.name || school.schoolRepId.email : 'Not assigned'}</td>
                    <td>{school.status === 'suspended' ? 'Suspended' : 'Active'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

