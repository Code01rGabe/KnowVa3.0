import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
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

  const handleAnnouncementSend = async (e) => {
    e.preventDefault();
    try {
      setAnnouncementStatus('');
      const response = await api.post('/admin/announcements', {
        title: newAnnouncement.title,
        message: newAnnouncement.message,
        audience: newAnnouncement.audience,
      });
      
      setAnnouncementStatus('Announcement sent successfully!');
      setNewAnnouncement({ title: '', message: '', audience: 'all' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setAnnouncementStatus('');
      }, 3000);
    } catch (error) {
      console.error('Error sending announcement:', error);
      setAnnouncementStatus(
        error.response?.data?.message || 'Error sending announcement. Please try again.'
      );
    }
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
    <DashboardLayout>
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Platform Command Center - Oversee every school, user, and system feature
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px',
          marginBottom: '32px'
        }}>
          {statCards.map((card, index) => {
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];
            const icons = ['🏫', '✅', '👥', '👨‍🏫', '🎓', '📚', '📝', '⏳', '📊'];
            return (
              <div
                key={card.label}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    backgroundColor: `${colors[index % colors.length]}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}>
                    {icons[index % icons.length]}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                    {card.label}
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
                    {card.value ?? 0}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px',
          marginBottom: '32px'
        }}>
          {actionCards.map((card) => (
            <div
              key={card.title}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                {card.subtitle}
              </p>
              {card.target.startsWith('/admin') ? (
                <button
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: 'transparent',
                    color: '#ff6600',
                    border: '1px solid #ff6600',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                  onClick={() => navigate(card.target)}
                >
                  Open
                </button>
              ) : (
                <a
                  href={card.target}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: 'transparent',
                    color: '#ff6600',
                    border: '1px solid #ff6600',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Go
                </a>
              )}
            </div>
          ))}
        </div>

        <div id="system-settings" style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          marginBottom: '32px',
        }}>
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

        <div id="announcements" style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          marginBottom: '32px',
        }}>
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
          {announcementStatus && (
            <div className={announcementStatus.toLowerCase().includes('error') ? 'error' : 'success'}>
              {announcementStatus}
            </div>
          )}
          <button className="btn btn-primary" type="submit">
            Send Announcement
          </button>
        </form>
      </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>Most Active Schools</h2>
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
    </DashboardLayout>
  );
};

export default AdminDashboard;

