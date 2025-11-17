import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import api from '../../utils/api';

const StudentDashboard = () => {
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
      console.log('Loading student dashboard...');
      const response = await api.get('/dashboard/student');
      console.log('Student dashboard loaded:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading student stats:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load dashboard data. Please check your connection.');
      // Set empty stats so the dashboard still renders
      setStats({ metrics: {}, classrooms: [], courses: [], upcomingAssignments: [], recentGrades: [] });
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

  const metrics = stats?.metrics || {};

  const metricCards = [
    { 
      label: 'Classes', 
      value: metrics.classroomCount ?? 0, 
      color: '#3b82f6',
      icon: '🏫'
    },
    { 
      label: 'Courses', 
      value: metrics.courseCount ?? 0,
      color: '#10b981',
      icon: '📚'
    },
    { 
      label: 'Avg Grade', 
      value: metrics.averageGrade ?? 'N/A',
      color: '#f59e0b',
      icon: '⭐'
    },
    { 
      label: 'Pending Assignments', 
      value: metrics.pendingAssignments ?? 0,
      color: '#ef4444',
      icon: '📝'
    },
  ];

  return (
    <DashboardLayout>
      <div>
        {/* Welcome Card */}
        <div style={{
          backgroundColor: 'var(--pastel-green, #d6f5e8)',
          borderRadius: '24px',
          padding: '48px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(214, 245, 232, 0.4)',
          border: '1px solid rgba(214, 245, 232, 0.6)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748b)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Welcome
            </p>
            <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-primary, #1e293b)', marginBottom: '20px', lineHeight: '1.2' }}>
              {user?.profile?.name || user?.email || 'Student'}
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
              Learner
            </div>
          </div>
          <div style={{ fontSize: '140px', opacity: 0.25, position: 'relative', zIndex: 0 }}>🎓</div>
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
          {metricCards.map((card) => (
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
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '24px' 
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid var(--border)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px' }}>My Classes</h2>
            {stats?.classrooms?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.classrooms.map((classroom) => (
                  <div key={classroom.id} style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>{classroom.name}</h3>
                    {classroom.level && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Level: {classroom.level}</p>}
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{classroom.teacherCount} teacher{classroom.teacherCount !== 1 ? 's' : ''}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No classes assigned yet.</p>
            )}
          </div>

          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid var(--border)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px' }}>My Courses</h2>
            {stats?.courses?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.courses.map((course) => (
                  <div key={course._id} style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }}
                    onClick={() => navigate(`/student/courses/${course._id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  >
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{course.title}</h3>
                    <button style={{ marginTop: '8px', padding: '6px 12px', fontSize: '13px', backgroundColor: 'transparent', color: '#ff6600', border: '1px solid #ff6600', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/student/courses/${course._id}`); }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>You are not enrolled in any courses yet.</p>
            )}
          </div>

          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid var(--border)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px' }}>Upcoming Assignments</h2>
            {stats?.upcomingAssignments?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>{assignment.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Due {new Date(assignment.dueDate).toLocaleDateString()} • {assignment.courseTitle}
                    </p>
                    <button style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: 'transparent', color: '#ff6600', border: '1px solid #ff6600', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => navigate(`/student/assignments/${assignment.id}`)}
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No upcoming assignments. Enjoy the breather!</p>
            )}
          </div>

          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid var(--border)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px' }}>Recent Grades</h2>
            {stats?.recentGrades?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.recentGrades.map((submission) => (
                  <div key={submission.id} style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>{submission.title}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Grade: <strong style={{ color: '#10b981' }}>{submission.grade}</strong></p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No graded submissions yet.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
