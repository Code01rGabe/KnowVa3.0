import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>{user?.role === 'teacher' ? 'My Courses' : 'Enrolled Courses'}</h1>
        {user?.role === 'teacher' && (
          <button
            className="btn btn-primary"
            onClick={() => navigate('/teacher/courses/new')}
          >
            Create New Course
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="card">
          <p>No courses found.</p>
          {user?.role === 'teacher' && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/teacher/courses/new')}
              style={{ marginTop: '10px' }}
            >
              Create Your First Course
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {courses.map((course) => (
            <div key={course._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h2 style={{ marginBottom: '10px' }}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/${user.role}/courses/${course._id}`);
                      }}
                      style={{ color: '#007bff', textDecoration: 'none' }}
                    >
                      {course.title}
                    </a>
                  </h2>
                  <p style={{ color: '#666', marginBottom: '10px' }}>{course.description}</p>
                  <p style={{ fontSize: '14px', color: '#888' }}>
                    Teacher: {course.teacherId?.profile?.name || course.teacherId?.email}
                  </p>
                  {user?.role === 'student' && (
                    <p style={{ fontSize: '14px', color: '#888' }}>
                      Enrolled Students: {course.enrolledStudents?.length || 0}
                    </p>
                  )}
                  {user?.role === 'teacher' && (
                    <p style={{ fontSize: '14px', color: '#888' }}>
                      Enrolled Students: {course.enrolledStudents?.length || 0}
                    </p>
                  )}
                </div>
                {user?.role === 'teacher' && (
                  <div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/teacher/courses/${course._id}/edit`)}
                      style={{ marginRight: '10px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(course._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;

