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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [featureFlags, setFeatureFlags] = useState({
    submissions: true,
    messaging: true,
    analytics: true,
  });
  const [branding, setBranding] = useState({
    platformName: 'KnowVa',
    primaryColor: '#ff6600',
  });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    audience: 'all',
  });
  const [announcementStatus, setAnnouncementStatus] = useState('');

  useEffect(() => {
    if (user) {
      loadAll();
    }
  }, [user]);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');
      await Promise.all([
        loadStats(),
        loadPreviewSchools(),
      ]);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('Loading admin stats...');
      const response = await api.get('/admin/stats');
      console.log('Admin stats loaded:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load statistics. Please check your connection.');
      throw error;
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
        { label: 'Schools', value: stats.stats.totalSchools ?? 0 },
        { label: 'Active Schools', value: stats.stats.activeSchools ?? 0 },
        { label: 'Users', value: stats.stats.totalUsers ?? 0 },
        { label: 'Teachers', value: stats.stats.teachers ?? 0 },
        { label: 'Students', value: stats.stats.students ?? 0 },
      ]
    : [];

  if (!user || loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary, #64748b)', marginBottom: '12px' }}>
              {!user ? 'Please log in...' : 'Loading dashboard...'}
            </p>
            {user && (
              <div style={{ width: '40px', height: '40px', border: '4px solid var(--border, #e2e8f0)', borderTop: '4px solid var(--accent, #ff6600)', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        {/* Welcome Card */}
        <div style={{
          backgroundColor: 'var(--pastel-pink, #ffd6e8)',
          borderRadius: '24px',
          padding: '48px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(255, 214, 232, 0.4)',
          border: '1px solid rgba(255, 214, 232, 0.6)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748b)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Welcome
            </p>
            <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-primary, #1e293b)', marginBottom: '20px', lineHeight: '1.2' }}>
              {user?.profile?.name || user?.email || 'Admin'}
            </h1>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              fontSize: '14px',
              color: 'var(--text-primary, #1e293b)',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}>
              Platform Admin
            </div>
          </div>
          <div style={{ fontSize: '140px', opacity: 0.25, position: 'relative', zIndex: 0 }}>👋</div>
        </div>

        {error && (
          <div style={{
            marginBottom: '24px',
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--error, #ef4444)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}>
            {error}
          </div>
        )}

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
                  backgroundColor: 'var(--card-bg, #fff)',
                  borderRadius: '16px',
                  padding: '28px',
                  boxShadow: '0 2px 8px var(--shadow, rgba(0,0,0,0.1))',
                  border: '1px solid var(--border, #e2e8f0)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 24px var(--shadow, rgba(0,0,0,0.15))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow, rgba(0,0,0,0.1))';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${colors[index % colors.length]}20, ${colors[index % colors.length]}10)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    boxShadow: `0 4px 12px ${colors[index % colors.length]}25`,
                  }}>
                    {icons[index % icons.length]}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', marginBottom: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {card.label}
                  </p>
                  <p style={{ 
                    fontSize: '40px', 
                    fontWeight: '800', 
                    color: 'var(--text-primary, #1e293b)', 
                    background: `linear-gradient(135deg, ${colors[index % colors.length]}, ${colors[(index + 1) % colors.length]})`, 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent', 
                    backgroundClip: 'text',
                    lineHeight: '1.2',
                  }}>
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
                backgroundColor: 'var(--card-bg, #fff)',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 2px 8px var(--shadow, rgba(0,0,0,0.1))',
                border: '1px solid var(--border, #e2e8f0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px var(--shadow, rgba(0,0,0,0.15))';
                e.currentTarget.style.borderColor = 'var(--accent, #ff6600)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow, rgba(0,0,0,0.1))';
                e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
              }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary, #1e293b)', marginBottom: '10px' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748b)', marginBottom: '20px', lineHeight: '1.6' }}>
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
          backgroundColor: 'var(--card-bg, #fff)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px var(--shadow, rgba(0,0,0,0.1))',
          border: '1px solid var(--border, #e2e8f0)',
          marginBottom: '32px',
        }}>
          
          
        </div>

        <div id="support" style={{
          backgroundColor: 'var(--card-bg, #fff)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px var(--shadow, rgba(0,0,0,0.1))',
          border: '1px solid var(--border, #e2e8f0)',
          marginBottom: '32px',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary, #1e293b)', marginBottom: '24px' }}>
            🎫 Support Desk
          </h2>
          <p style={{ color: 'var(--text-secondary, #64748b)', marginBottom: '20px' }}>
            All support tickets will appear here. Users can create tickets from their dashboards.
          </p>
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            backgroundColor: 'var(--bg-secondary, #f8fafc)',
            borderRadius: '12px',
            border: '1px solid var(--border, #e2e8f0)',
          }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>📨</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary, #1e293b)', marginBottom: '8px' }}>
              Support Ticket Management
            </h3>
            <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '15px' }}>
              Coming Soon - View and manage all user support tickets in one place
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--card-bg, #fff)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 2px 8px var(--shadow, rgba(0,0,0,0.1))',
          border: '1px solid var(--border, #e2e8f0)',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary, #1e293b)', marginBottom: '24px' }}>Most Active Schools</h2>
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
