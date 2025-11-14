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

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/dashboard/student');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading student stats:', error);
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

  const metrics = stats?.metrics || {};

  const metricCards = [
    { 
      label: 'Classes', 
      value: metrics.classroomCount || 0, 
      color: '#3b82f6',
      icon: '🏫'
    },
    { 
      label: 'Courses', 
      value: metrics.courseCount || 0,
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
      value: metrics.pendingAssignments || 0,
      color: '#ef4444',
      icon: '📝'
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            You've got this, {user?.profile?.name || 'Learner'}!
          </p>
        </div>

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
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>My Classes</h2>
            {stats?.classrooms?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.classrooms.map((classroom) => (
                  <div key={classroom.id} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>{classroom.name}</h3>
                    {classroom.level && <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Level: {classroom.level}</p>}
                    <p style={{ fontSize: '13px', color: '#64748b' }}>{classroom.teacherCount} teacher{classroom.teacherCount !== 1 ? 's' : ''}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '14px' }}>No classes assigned yet.</p>
            )}
          </div>

          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>My Courses</h2>
            {stats?.courses?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.courses.map((course) => (
                  <div key={course._id} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                    onClick={() => navigate(`/student/courses/${course._id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  >
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{course.title}</h3>
                    <button style={{ marginTop: '8px', padding: '6px 12px', fontSize: '13px', backgroundColor: 'transparent', color: '#ff6600', border: '1px solid #ff6600', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/student/courses/${course._id}`); }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '14px' }}>You are not enrolled in any courses yet.</p>
            )}
          </div>

          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>Upcoming Assignments</h2>
            {stats?.upcomingAssignments?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>{assignment.title}</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
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
              <p style={{ color: '#64748b', fontSize: '14px' }}>No upcoming assignments. Enjoy the breather!</p>
            )}
          </div>

          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>Recent Grades</h2>
            {stats?.recentGrades?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.recentGrades.map((submission) => (
                  <div key={submission.id} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>{submission.title}</h3>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Grade: <strong style={{ color: '#10b981' }}>{submission.grade}</strong></p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '14px' }}>No graded submissions yet.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
