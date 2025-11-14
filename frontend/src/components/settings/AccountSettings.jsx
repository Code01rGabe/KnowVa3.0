import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import './AccountSettings.css';

const AccountSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.profile?.name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
  });
  const [message, setMessage] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <DashboardLayout>
      <div className="account-settings-container">
        <div className="settings-header">
          <h1>Account Settings</h1>
          <p>Manage your account information</p>
        </div>

        <div className="settings-tabs">
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={activeTab === 'security' ? 'active' : ''}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-card">
              <h2>Profile Information</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="Enter your email"
                    disabled
                  />
                  <small>Email cannot be changed</small>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
                {message && (
                  <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                    {message}
                  </div>
                )}
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-card">
              <h2>Security Settings</h2>
              <div className="form-group">
                <label>Change Password</label>
                <input type="password" placeholder="Current password" />
                <input type="password" placeholder="New password" style={{ marginTop: '12px' }} />
                <input type="password" placeholder="Confirm new password" style={{ marginTop: '12px' }} />
                <button type="button" className="btn btn-primary" style={{ marginTop: '16px' }}>
                  Update Password
                </button>
              </div>
            </div>
          )}

          <div style={{
            backgroundColor: 'var(--card-bg, #fff)',
            borderRadius: '16px',
            padding: '32px',
            marginTop: '24px',
            border: '1px solid var(--border, #e2e8f0)',
            boxShadow: '0 2px 8px var(--shadow, rgba(0,0,0,0.1))',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary, #1e293b)', marginBottom: '12px' }}>
              Logout
            </h2>
            <p style={{ color: 'var(--text-secondary, #64748b)', marginBottom: '20px', fontSize: '15px' }}>
              Sign out of your account. You'll need to login again to access your account.
            </p>
            <button 
              onClick={() => setShowLogoutModal(true)} 
              style={{
                padding: '12px 24px',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
            onClick={() => setShowLogoutModal(false)}
          >
            <div 
              style={{
                backgroundColor: 'var(--card-bg, #fff)',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 8px 32px var(--shadow, rgba(0,0,0,0.2))',
                border: '1px solid var(--border, #e2e8f0)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary, #1e293b)', marginBottom: '12px' }}>
                Confirm Logout
              </h2>
              <p style={{ color: 'var(--text-secondary, #64748b)', marginBottom: '24px', fontSize: '15px', lineHeight: '1.6' }}>
                Are you sure you want to logout? You'll need to login again to access your account.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary, #1e293b)',
                    border: '1px solid var(--border, #e2e8f0)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #f8fafc)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
