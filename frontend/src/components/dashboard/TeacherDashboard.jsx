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

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/dashboard/teacher');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  const metricCards = stats?.metrics
    ? [
        { 
          label: 'Classes', 
          value: stats.metrics.classroomCount || 0, 
          color: '#3b82f6',
          icon: '🏫'
        },
        { 
          label: 'Courses', 
          value: stats.metrics.courseCount,
          color: '#10b981',
          icon: '📚'
        },
        { 
          label: 'Students', 
          value: stats.metrics.studentCount,
          color: '#f59e0b',
          icon: '👥'
        },
        { 
          label: 'Pending Submissions', 
          value: stats.metrics.pendingSubmissions,
          color: '#ef4444',
          icon: '📝'
        },
      ]
    : [];

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Welcome back, {user?.profile?.name || 'Educator'}
          </p>
        </div>

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
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                  {card.label}
                </p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
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
