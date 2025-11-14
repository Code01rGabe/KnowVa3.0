import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children, navItems = [] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getNavItems = () => {
    if (navItems.length > 0) return navItems;
    
    // Default nav items based on role
    if (user?.role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { id: 'schools', label: 'Schools', path: '/admin/schools', icon: '🏫' },
        { id: 'users', label: 'Users', path: '/admin/users', icon: '👥' },
      ];
    } else if (user?.role === 'teacher') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/teacher/dashboard', icon: '📊' },
        { id: 'courses', label: 'Courses', path: '/teacher/courses', icon: '📚' },
        { id: 'assignments', label: 'Assignments', path: '/teacher/assignments', icon: '📝' },
      ];
    } else if (user?.role === 'student') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/student/dashboard', icon: '📊' },
        { id: 'courses', label: 'Courses', path: '/student/courses', icon: '📚' },
        { id: 'assignments', label: 'Assignments', path: '/student/assignments', icon: '📝' },
      ];
    } else if (user?.role === 'schoolRep') {
      return [
        { id: 'overview', label: 'Overview', path: '/school-rep/dashboard', icon: '📊' },
        { id: 'classes', label: 'Classes', path: '/school-rep/dashboard', icon: '🏫' },
        { id: 'subjects', label: 'Subjects', path: '/school-rep/dashboard', icon: '📚' },
      ];
    }
    return [];
  };

  const items = getNavItems();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 1001,
            padding: '8px 12px',
            backgroundColor: '#1e293b',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: isMobile ? (sidebarOpen ? '260px' : '0') : '260px',
          backgroundColor: '#1e293b',
          color: '#fff',
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 1000,
          transition: 'width 0.3s ease',
          overflow: isMobile && !sidebarOpen ? 'hidden' : 'auto',
          boxShadow: isMobile ? '2px 0 8px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ff6600, #ff7a18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              K
            </div>
            <span style={{ fontSize: '20px', fontWeight: '700' }}>KnowVa</span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '24px 0', overflowY: 'auto' }}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: isActive(item.path) ? 'rgba(255, 102, 0, 0.15)' : 'transparent',
                color: isActive(item.path) ? '#ff6600' : '#cbd5e1',
                border: 'none',
                borderLeft: isActive(item.path) ? '3px solid #ff6600' : '3px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '15px',
                fontWeight: isActive(item.path) ? '600' : '400',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User & Logout */}
        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>Logged in as</p>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>
              {user?.profile?.name || user?.email}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {user?.role === 'admin' ? 'Super Admin' : user?.role === 'schoolRep' ? 'School Admin' : user?.role === 'teacher' ? 'Teacher' : 'Student'}
            </p>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <span>🚪</span>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
        />
      )}

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: isMobile ? '0' : '260px',
          backgroundColor: '#f5f7fa',
          minHeight: '100vh',
          width: isMobile ? '100%' : 'calc(100% - 260px)',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <div style={{ 
          padding: isMobile ? '16px' : '32px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

