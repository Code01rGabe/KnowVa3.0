import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import api from '../../utils/api';

const CourseList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await api.delete(`/courses/${courseId}`);
      loadCourses();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting course');
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

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
            {user?.role === 'teacher' ? 'My Courses' : 'Enrolled Courses'}
          </h1>
          {user?.role === 'teacher' && (
            <button
              onClick={() => navigate('/teacher/courses/new')}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                backgroundColor: '#ff6600',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Create New Course
            </button>
          )}
        </div>

        {courses.length === 0 ? (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '48px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
          }}>
            <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '20px' }}>No courses found.</p>
            {user?.role === 'teacher' && (
              <button
                onClick={() => navigate('/teacher/courses/new')}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  backgroundColor: '#ff6600',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Create Your First Course
              </button>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px' 
          }}>
            {courses.map((course) => (
              <div
                key={course._id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
                onClick={() => navigate(`/${user.role}/courses/${course._id}`)}
              >
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  marginBottom: '12px',
                  cursor: 'pointer',
                }}>
                  {course.title}
                </h2>
                <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '14px' }}>
                  {course.description}
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
                    Teacher: {course.teacherId?.profile?.name || course.teacherId?.email}
                  </p>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                    Enrolled Students: {course.enrolledStudents?.length || 0}
                  </p>
                </div>
                {user?.role === 'teacher' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/teacher/courses/${course._id}/edit`);
                      }}
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        backgroundColor: 'transparent',
                        color: '#ff6600',
                        border: '1px solid #ff6600',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(course._id);
                      }}
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        backgroundColor: 'transparent',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CourseList;
