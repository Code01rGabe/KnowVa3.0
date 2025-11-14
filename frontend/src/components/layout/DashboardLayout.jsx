import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children, navItems = [] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, [isMounted]);

  const getNavItems = () => {
    if (navItems.length > 0) return navItems;
    
    // Default nav items based on role
    if (user?.role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { id: 'schools', label: 'Schools', path: '/admin/schools', icon: '🏫' },
        { id: 'users', label: 'Users', path: '/admin/users', icon: '👥' },
        { id: 'settings', label: 'Account Settings', path: '/settings', icon: '⚙️' },
      ];
    } else if (user?.role === 'teacher') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/teacher/dashboard', icon: '📊' },
        { id: 'courses', label: 'Courses', path: '/teacher/courses', icon: '📚' },
        { id: 'assignments', label: 'Assignments', path: '/teacher/assignments', icon: '📝' },
        { id: 'settings', label: 'Account Settings', path: '/settings', icon: '⚙️' },
      ];
    } else if (user?.role === 'student') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/student/dashboard', icon: '📊' },
        { id: 'courses', label: 'Courses', path: '/student/courses', icon: '📚' },
        { id: 'assignments', label: 'Assignments', path: '/student/assignments', icon: '📝' },
        { id: 'settings', label: 'Account Settings', path: '/settings', icon: '⚙️' },
      ];
    } else if (user?.role === 'schoolRep') {
      return [
        { id: 'overview', label: 'Overview', path: '/school-rep/dashboard', icon: '📊' },
        { id: 'classes', label: 'Classes', path: '/school-rep/dashboard', icon: '🏫' },
        { id: 'subjects', label: 'Subjects', path: '/school-rep/dashboard', icon: '📚' },
        { id: 'settings', label: 'Account Settings', path: '/settings', icon: '⚙️' },
      ];
    }
    return [];
  };

  const items = getNavItems();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (!isMounted) {
    return null; // Prevent flash of incorrect theme on initial load
  }

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-primary, #f5f7fa)',
      color: 'var(--text-primary, #1f1b2c)',
      transition: 'background-color 0.3s ease, color 0.3s ease',
    }}>
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
          backgroundColor: 'var(--sidebar-bg, #f5f0e8)',
          color: 'var(--text-primary, #1e293b)',
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 1000,
          transition: 'all 0.3s ease',
          overflow: isMobile && !sidebarOpen ? 'hidden' : 'auto',
          borderRight: '1px solid var(--border, #e2e8f0)',
          boxShadow: isMobile ? '2px 0 8px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid var(--border, #e2e8f0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#fff',
            }}>
              K
            </div>
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary, #1e293b)' }}>
              KnowVa
            </span>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--gradient-primary)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#fff',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(255, 154, 158, 0.3)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 154, 158, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 154, 158, 0.3)';
            }}
          >
            <span>{theme === 'light' ? '🌙' : '☀️'}</span>
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginTop: '24px',
            padding: '0 8px',
          }}>
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: isActive(item.path) 
                    ? 'var(--accent, #ff6600)' 
                    : 'transparent',
                  border: 'none',
                  color: isActive(item.path) 
                    ? '#fff' 
                    : 'var(--text-primary, #1e293b)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  margin: '0 4px',
                  fontWeight: isActive(item.path) ? '600' : '400',
                }}
                onMouseOver={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 102, 0, 0.1)';
                    e.currentTarget.style.color = 'var(--accent, #ff6600)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-primary, #1e293b)';
                  }
                }}
              >
                <span style={{ 
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div style={{ padding: '24px', borderTop: '1px solid var(--border, #e2e8f0)', marginTop: 'auto' }}>
          <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'var(--card-bg, #fff)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', marginBottom: '4px' }}>Logged in as</p>
            <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary, #1e293b)' }}>
              {user?.profile?.name || user?.email}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', marginTop: '4px' }}>
              {user?.role === 'admin' ? 'Super Admin' : user?.role === 'schoolRep' ? 'School Admin' : user?.role === 'teacher' ? 'Teacher' : 'Student'}
            </p>
          </div>
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
          padding: isMobile ? '80px 16px 16px' : '24px',
          transition: 'all 0.3s ease',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: 'var(--card-bg, #fff)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid var(--border, #e2e8f0)',
          position: 'sticky',
          top: '16px',
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          transform: isScrolled ? 'translateY(0)' : 'translateY(0)',
          ...(isScrolled && {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }),
        }}>
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: 'var(--text-primary, #1e293b)',
              margin: 0,
              lineHeight: 1.2,
            }}>
              {items.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h1>
            <p style={{ 
              color: 'var(--text-secondary, #64748b)', 
              fontSize: '14px', 
              margin: '4px 0 0',
              transition: 'color 0.3s ease',
            }}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </header>
        <div style={{ 
          padding: isMobile ? '16px' : '32px',
          maxWidth: '1400px',
          margin: '0 auto',
          color: 'var(--text-primary, #1e293b)',
        }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

