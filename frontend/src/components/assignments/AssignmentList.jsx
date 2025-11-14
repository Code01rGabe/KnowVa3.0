import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
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
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>Assignments</h1>
          {user?.role === 'teacher' && (
            <button
              onClick={() => navigate('/teacher/assignments/new')}
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
              Create New Assignment
            </button>
          )}
        </div>

        {assignments.length === 0 ? (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '48px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
          }}>
            <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '20px' }}>No assignments found.</p>
            {user?.role === 'teacher' && (
              <button
                onClick={() => navigate('/teacher/assignments/new')}
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
                Create Your First Assignment
              </button>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px' 
          }}>
            {assignments.map((assignment) => (
              <div
                key={assignment._id}
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
                onClick={() => navigate(`/${user.role}/assignments/${assignment._id}`)}
              >
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  marginBottom: '12px',
                }}>
                  {assignment.title}
                </h2>
                <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '14px' }}>
                  {assignment.description}
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
                    Course: {assignment.courseId?.title}
                  </p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
                    Due: {new Date(assignment.dueDate).toLocaleString()}
                  </p>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                    Max Points: {assignment.maxPoints}
                  </p>
                </div>
                {user?.role === 'teacher' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/teacher/assignments/${assignment._id}/edit`);
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
                        handleDelete(assignment._id);
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

export default AssignmentList;
