import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const AssignmentList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const response = await api.get('/assignments');
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await api.delete(`/assignments/${assignmentId}`);
      loadAssignments();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting assignment');
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Assignments</h1>
        {user?.role === 'teacher' && (
          <button
            className="btn btn-primary"
            onClick={() => navigate('/teacher/assignments/new')}
          >
            Create New Assignment
          </button>
        )}
      </div>

      {assignments.length === 0 ? (
        <div className="card">
          <p>No assignments found.</p>
          {user?.role === 'teacher' && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/teacher/assignments/new')}
              style={{ marginTop: '10px' }}
            >
              Create Your First Assignment
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {assignments.map((assignment) => (
            <div key={assignment._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h2 style={{ marginBottom: '10px' }}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/${user.role}/assignments/${assignment._id}`);
                      }}
                      style={{ color: '#007bff', textDecoration: 'none' }}
                    >
                      {assignment.title}
                    </a>
                  </h2>
                  <p style={{ color: '#666', marginBottom: '10px' }}>{assignment.description}</p>
                  <p style={{ fontSize: '14px', color: '#888' }}>
                    Course: {assignment.courseId?.title}
                  </p>
                  <p style={{ fontSize: '14px', color: '#888' }}>
                    Due: {new Date(assignment.dueDate).toLocaleString()}
                  </p>
                  <p style={{ fontSize: '14px', color: '#888' }}>
                    Max Points: {assignment.maxPoints}
                  </p>
                </div>
                {user?.role === 'teacher' && (
                  <div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/teacher/assignments/${assignment._id}/edit`)}
                      style={{ marginRight: '10px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(assignment._id)}
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

export default AssignmentList;

