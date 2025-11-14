import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
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
    return <div className="container">Loading...</div>;
  }

  const metricCards = stats?.metrics
    ? [
        { label: 'Courses', value: stats.metrics.courseCount },
        { label: 'Unique Students', value: stats.metrics.studentCount },
        { label: 'Avg Students/Course', value: stats.metrics.averageStudentsPerCourse },
        { label: 'Avg Grade', value: stats.metrics.averageGrade ?? 'N/A' },
        { label: 'Pending Submissions', value: stats.metrics.pendingSubmissions },
      ]
    : [];

  return (
    <div className="container">
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <p className="badge">Teacher</p>
          <h1>Welcome back, {user?.profile?.name || 'Educator'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Keep your classes inspired with a crystal-clear view of progress, engagement, and upcoming deadlines.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="stats-grid">
        {metricCards.map((card, index) => (
          <div key={card.label} className={`stats-card glass-card delay-${index % 3}`}>
            <h3>{card.label}</h3>
            <div className="value">{card.value ?? 0}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={() => navigate('/teacher/courses')}>
          Manage Courses
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/teacher/assignments')}>
          Manage Assignments
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="card glass-card fade-up">
          <h2>Recent Courses</h2>
          {stats?.recentCourses?.length ? (
            <ul>
              {stats.recentCourses.map((course) => (
                <li key={course.id} style={{ marginBottom: '12px' }}>
                  <strong>{course.title}</strong>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {course.students} students enrolled
                  </p>
                  <button
                    className="btn outline-button"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                    onClick={() => navigate(`/teacher/courses/${course.id}`)}
                  >
                    View course
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No courses yet. <button className="btn btn-primary" onClick={() => navigate('/teacher/courses/new')}>Create one</button></p>
          )}
        </div>

        <div className="card glass-card fade-up delay-1">
          <h2>Upcoming Deadlines</h2>
          {stats?.upcomingAssignments?.length ? (
            <ul>
              {stats.upcomingAssignments.map((assignment) => (
                <li key={assignment.id} style={{ marginBottom: '12px' }}>
                  <strong>{assignment.title}</strong>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Due {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                  <button
                    className="btn outline-button"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                    onClick={() => navigate(`/teacher/assignments/${assignment.id}`)}
                  >
                    Review
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming assignments.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

