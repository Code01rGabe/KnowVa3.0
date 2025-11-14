import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import api from '../../utils/api';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCourse();
    loadAssignments();
    if (user?.role === 'teacher') {
      loadAvailableStudents();
    }
  }, [id, user?.role]);

  const loadCourse = async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.course);
      setEnrolledStudents(response.data.course.enrolledStudents || []);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await api.get(`/assignments/course/${id}`);
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const loadAvailableStudents = async () => {
    try {
      setStudentsLoading(true);
      setStudentsError('');
      const response = await api.get('/school/students');
      setAvailableStudents(response.data.students || []);
    } catch (error) {
      console.error('Error loading available students:', error);
      setStudentsError(error.response?.data?.message || 'Unable to load students');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!selectedStudentId) {
      setMessage('Please select a student to enroll.');
      return;
    }

    try {
      await api.post(`/courses/${id}/enroll`, { studentId: selectedStudentId });
      setMessage('Student enrolled successfully');
      setSelectedStudentId('');
      await loadCourse();
      await loadAvailableStudents();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error enrolling student');
    }
  };

  const handleRemoveStudent = async (studentIdToRemove) => {
    if (!window.confirm('Are you sure you want to remove this student?')) {
      return;
    }

    try {
      await api.post(`/courses/${id}/remove-student`, { studentId: studentIdToRemove });
      setMessage('Student removed successfully');
      await loadCourse();
      await loadAvailableStudents();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error removing student');
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

  if (!course) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <p>Course not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const enrolledStudentIds = new Set(enrolledStudents.map((student) => student._id));
  const unenrolledStudents = availableStudents.filter((student) => !enrolledStudentIds.has(student._id));

  return (
    <DashboardLayout>
      <div>
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: 'transparent',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            {course.title}
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>{course.description}</p>
        </div>

        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              backgroundColor: message.toLowerCase().includes('error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: message.toLowerCase().includes('error') ? '#dc2626' : '#059669',
              border: `1px solid ${message.toLowerCase().includes('error') ? '#fecaca' : '#a7f3d0'}`,
            }}
          >
            {message}
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>
              Course Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Teacher</p>
                <p style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b' }}>
                  {course.teacherId?.profile?.name || course.teacherId?.email}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Enrolled Students</p>
                <p style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b' }}>
                  {enrolledStudents.length}
                </p>
              </div>
            </div>
          </div>

          {user?.role === 'teacher' && (
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>
                Enroll Student
              </h2>
              <form onSubmit={handleEnrollStudent}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '8px' }}>
                    Select Student
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '14px',
                    }}
                  >
                    <option value="">Choose a student...</option>
                    {unenrolledStudents.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.profile?.name || student.email}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    fontSize: '14px',
                    backgroundColor: '#ff6600',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Enroll Student
                </button>
              </form>
            </div>
          )}
        </div>

        {user?.role === 'teacher' && enrolledStudents.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>
              Enrolled Students ({enrolledStudents.length})
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map((student) => (
                    <tr key={student._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#1e293b' }}>
                        {student.profile?.name || student.email}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>
                        {student.email}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleRemoveStudent(student._id)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
              Assignments ({assignments.length})
            </h2>
            {user?.role === 'teacher' && (
              <button
                onClick={() => navigate(`/teacher/assignments/new?courseId=${id}`)}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  backgroundColor: '#ff6600',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Create Assignment
              </button>
            )}
          </div>
          {assignments.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '14px' }}>No assignments yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assignments.map((assignment) => (
                <div
                  key={assignment._id}
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
                  onClick={() => navigate(`/${user.role}/assignments/${assignment._id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                        {assignment.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                      <p style={{ fontSize: '13px', color: '#64748b' }}>
                        Max Points: {assignment.maxPoints}
                      </p>
                    </div>
                    {user?.role === 'teacher' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/teacher/assignments/${assignment._id}/submissions`);
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: '13px',
                          backgroundColor: 'transparent',
                          color: '#ff6600',
                          border: '1px solid #ff6600',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        View Submissions
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
