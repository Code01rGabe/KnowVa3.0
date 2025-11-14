import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
    return <div className="container">Loading...</div>;
  }

  if (!course) {
    return <div className="container">Course not found</div>;
  }

  const enrolledStudentIds = new Set(enrolledStudents.map((student) => student._id));
  const unenrolledStudents = availableStudents.filter((student) => !enrolledStudentIds.has(student._id));

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="card">
        <h1>{course.title}</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>{course.description}</p>
        <p><strong>Teacher:</strong> {course.teacherId?.profile?.name || course.teacherId?.email}</p>
      </div>

      {user?.role === 'teacher' && (
        <>
          <div className="card">
            <h2>Enroll Student</h2>
            {message && (
              <div className={message.toLowerCase().includes('error') ? 'error' : 'success'}>
                {message}
              </div>
            )}
            {studentsError && <div className="error">{studentsError}</div>}
            <form onSubmit={handleEnrollStudent} style={{ display: 'flex', gap: '10px', alignItems: 'end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 250px', marginBottom: 0 }}>
                <label>Select Student</label>
                {studentsLoading ? (
                  <div>Loading students...</div>
                ) : (
                  <>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      disabled={unenrolledStudents.length === 0}
                      required
                    >
                      <option value="">Choose a student</option>
                      {unenrolledStudents.map((student) => (
                        <option key={student._id} value={student._id}>
                          {(student.profile?.name || 'Unnamed Student') + ` (${student.email})`}
                        </option>
                      ))}
                    </select>
                    {unenrolledStudents.length === 0 && !studentsError && (
                      <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                        No available students to enroll. Ask students to join your school first.
                      </p>
                    )}
                  </>
                )}
              </div>
              <button type="submit" className="btn btn-primary" disabled={!selectedStudentId || studentsLoading}>
                Enroll
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Enrolled Students ({enrolledStudents.length})</h2>
            {enrolledStudents.length === 0 ? (
              <p>No students enrolled yet.</p>
            ) : (
              <ul>
                {enrolledStudents.map((student) => (
                  <li key={student._id} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{student.profile?.name || student.email}</span>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRemoveStudent(student._id)}
                      style={{ padding: '5px 10px', fontSize: '14px' }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h2>Assignments ({assignments.length})</h2>
            {assignments.length === 0 ? (
              <p>No assignments yet.</p>
            ) : (
              <ul>
                {assignments.map((assignment) => (
                  <li key={assignment._id} style={{ marginBottom: '10px' }}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/teacher/assignments/${assignment._id}`);
                      }}
                      style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {assignment.title}
                    </a>
                    <span style={{ marginLeft: '10px', color: '#666' }}>
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/teacher/assignments/new?courseId=${id}`)}
              style={{ marginTop: '10px' }}
            >
              Create Assignment
            </button>
          </div>
        </>
      )}

      {user?.role === 'student' && (
        <div className="card">
          <h2>Assignments ({assignments.length})</h2>
          {assignments.length === 0 ? (
            <p>No assignments yet.</p>
          ) : (
            <ul>
              {assignments.map((assignment) => (
                <li key={assignment._id} style={{ marginBottom: '10px' }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/student/assignments/${assignment._id}`);
                    }}
                    style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    {assignment.title}
                  </a>
                  <span style={{ marginLeft: '10px', color: '#666' }}>
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDetail;

