import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import api from '../../utils/api';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading teacher dashboard...');
      const response = await api.get('/dashboard/teacher');
      console.log('Teacher dashboard loaded:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load dashboard data. Please check your connection.');
      // Set empty stats so the dashboard still renders
      setStats({ metrics: {}, classrooms: [], recentCourses: [], upcomingAssignments: [] });
    } finally {
      setLoading(false);
    }
  };

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

  const metricCards = stats?.metrics
    ? [
        { 
          label: 'Classes', 
          value: stats.metrics.classroomCount ?? 0, 
          color: '#3b82f6',
          icon: '🏫'
        },
        { 
          label: 'Courses', 
          value: stats.metrics.courseCount ?? 0,
          color: '#10b981',
          icon: '📚'
        },
        { 
          label: 'Students', 
          value: stats.metrics.studentCount ?? 0,
          color: '#f59e0b',
          icon: '👥'
        },
        { 
          label: 'Pending Submissions', 
          value: stats.metrics.pendingSubmissions ?? 0,
          color: '#ef4444',
          icon: '📝'
        },
      ]
    : [];

  return (
    <DashboardLayout>
      <div>
        {/* Welcome Card */}
        <div style={{
          backgroundColor: 'var(--pastel-blue, #d6e5ff)',
          borderRadius: '24px',
          padding: '48px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(214, 229, 255, 0.4)',
          border: '1px solid rgba(214, 229, 255, 0.6)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748b)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Welcome
            </p>
            <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-primary, #1e293b)', marginBottom: '20px', lineHeight: '1.2' }}>
              {user?.profile?.name || user?.email || 'Teacher'}
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
              Educator
            </div>
          </div>
          <div style={{ fontSize: '140px', opacity: 0.25, position: 'relative', zIndex: 0 }}>👨‍🏫</div>
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

        {/* Metric Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px',
          marginBottom: '32px'
        }}>
          {metricCards.map((card, index) => (
            <div
              key={card.label}
              style={{
                backgroundColor: 'var(--card-bg, #fff)',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 4px 12px var(--shadow, rgba(0,0,0,0.1))',
                border: '1px solid var(--border, #e2e8f0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 24px var(--shadow, rgba(0,0,0,0.15))';
                e.currentTarget.style.borderColor = 'var(--accent, #ff6600)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px var(--shadow, rgba(0,0,0,0.1))';
                e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  backgroundColor: `${card.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}>
                  {card.icon}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', marginBottom: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {card.label}
                </p>
                <p style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary, #1e293b)', lineHeight: '1.2' }}>
                  {card.value ?? 0}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '24px' 
        }}>
          {/* My Classes */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>My Classes</h2>
            </div>
            {stats?.classrooms?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.classrooms.map((classroom) => (
                  <div
                    key={classroom.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                    onClick={() => navigate(`/teacher/classes/${classroom.id}`)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                        {classroom.name}
                      </h3>
                    </div>
                    {classroom.level && (
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                        Level: {classroom.level}
                      </p>
                    )}
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                      {classroom.studentCount} students
                    </p>
                    <button
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        backgroundColor: '#ff6600',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/teacher/classes/${classroom.id}`);
                      }}
                    >
                      Manage Class
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                No classes assigned yet. Contact your school administrator.
              </p>
            )}
          </div>

          {/* Recent Courses */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Recent Courses</h2>
              <button
                onClick={() => navigate('/teacher/courses')}
                style={{
                  fontSize: '13px',
                  color: '#ff6600',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                View all
              </button>
            </div>
            {stats?.recentCourses?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.recentCourses.map((course) => (
                  <div
                    key={course.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onClick={() => navigate(`/teacher/courses/${course.id}`)}
                  >
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                      {course.students} students enrolled
                    </p>
                    <button
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        backgroundColor: 'transparent',
                        color: '#ff6600',
                        border: '1px solid #ff6600',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/teacher/courses/${course.id}`);
                      }}
                    >
                      View course
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>
                  No courses yet.
                </p>
                <button
                  onClick={() => navigate('/teacher/courses/new')}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: '#ff6600',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Create Course
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Upcoming Deadlines</h2>
              <button
                onClick={() => navigate('/teacher/assignments')}
                style={{
                  fontSize: '13px',
                  color: '#ff6600',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                View all
              </button>
            </div>
            {stats?.upcomingAssignments?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                      {assignment.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                      Due {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => navigate(`/teacher/assignments/${assignment.id}`)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        backgroundColor: 'transparent',
                        color: '#ff6600',
                        border: '1px solid #ff6600',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '14px' }}>No upcoming assignments.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
