import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
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
    return <div className="container">Loading...</div>;
  }

  const metrics = stats?.metrics || {};

  return (
    <div className="container">
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <p className="badge">Student</p>
          <h1>You've got this, {user?.profile?.name || 'Learner'}!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Keep an eye on your courses, grades, and upcoming assignments—all in one place.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="stats-grid">
        <div className="stats-card glass-card">
          <h3>Courses</h3>
          <div className="value">{metrics.courseCount || 0}</div>
        </div>
        <div className="stats-card glass-card delay-1">
          <h3>Avg Grade</h3>
          <div className="value">{metrics.averageGrade ?? 'N/A'}</div>
        </div>
        <div className="stats-card glass-card delay-2">
          <h3>Completed Assignments</h3>
          <div className="value">{metrics.completedAssignments || 0}</div>
        </div>
        <div className="stats-card glass-card delay-3">
          <h3>Pending Assignments</h3>
          <div className="value">{metrics.pendingAssignments || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="card glass-card fade-up">
          <h2>My Courses</h2>
          {stats?.courses?.length ? (
            <ul>
              {stats.courses.map((course) => (
                <li key={course._id} style={{ marginBottom: '12px' }}>
                  <strong>{course.title}</strong>
                  <button
                    className="btn outline-button"
                    style={{ padding: '6px 12px', fontSize: '13px', marginLeft: '10px' }}
                    onClick={() => navigate(`/student/courses/${course._id}`)}
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>You are not enrolled in any courses yet.</p>
          )}
        </div>

        <div className="card glass-card fade-up delay-1">
          <h2>Upcoming Assignments</h2>
          {stats?.upcomingAssignments?.length ? (
            <ul>
              {stats.upcomingAssignments.map((assignment) => (
                <li key={assignment.id} style={{ marginBottom: '12px' }}>
                  <strong>{assignment.title}</strong>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Due {new Date(assignment.dueDate).toLocaleDateString()} • {assignment.courseTitle}
                  </p>
                  <button
                    className="btn outline-button"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                    onClick={() => navigate(`/student/assignments/${assignment.id}`)}
                  >
                    Open
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming assignments. Enjoy the breather!</p>
          )}
        </div>

        <div className="card glass-card fade-up delay-2">
          <h2>Recent Grades</h2>
          {stats?.recentGrades?.length ? (
            <ul>
              {stats.recentGrades.map((submission) => (
                <li key={submission.id} style={{ marginBottom: '10px' }}>
                  <strong>{submission.title}</strong>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Grade: {submission.grade}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No graded submissions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

