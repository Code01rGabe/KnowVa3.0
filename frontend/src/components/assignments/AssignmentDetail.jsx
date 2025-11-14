import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import api from '../../utils/api';

const AssignmentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignment();
    if (user?.role === 'student') {
      loadSubmission();
    }
  }, [id]);

  const loadAssignment = async () => {
    try {
      const response = await api.get(`/assignments/${id}`);
      setAssignment(response.data.assignment);
    } catch (error) {
      console.error('Error loading assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmission = async () => {
    try {
      const response = await api.get(`/submissions/assignment/${id}`);
      setSubmission(response.data.submission);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error loading submission:', error);
      }
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

  if (!assignment) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <p>Assignment not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const isPastDue = new Date(assignment.dueDate) < new Date();

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
            {assignment.title}
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>{assignment.description}</p>
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          marginBottom: '24px',
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Course</p>
              <p style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b' }}>
                {assignment.courseId?.title}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Due Date</p>
              <p style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b' }}>
                {new Date(assignment.dueDate).toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Max Points</p>
              <p style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b' }}>
                {assignment.maxPoints}
              </p>
            </div>
            {isPastDue && (
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Status</p>
                <p style={{ fontSize: '15px', fontWeight: '500', color: '#ef4444' }}>Past Due</p>
              </div>
            )}
          </div>
        </div>

        {user?.role === 'teacher' && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Submissions</h2>
              <button
                onClick={() => navigate(`/teacher/assignments/${id}/submissions`)}
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
                View All Submissions
              </button>
            </div>
          </div>
        )}

        {user?.role === 'student' && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>
              My Submission
            </h2>
            {submission ? (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Status</p>
                  <p style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b' }}>
                    {submission.status === 'graded' ? 'Graded' : 'Pending'}
                  </p>
                </div>
                {submission.grade !== null && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Grade</p>
                    <p style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b' }}>
                      {submission.grade} / {assignment.maxPoints}
                    </p>
                  </div>
                )}
                {submission.feedback && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Feedback</p>
                    <p style={{ fontSize: '15px', color: '#1e293b' }}>{submission.feedback}</p>
                  </div>
                )}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Submitted</p>
                  <p style={{ fontSize: '15px', color: '#1e293b' }}>
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/student/assignments/${id}/submit`)}
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
                  {submission.status === 'graded' ? 'Resubmit' : 'Update Submission'}
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                  You haven't submitted this assignment yet.
                </p>
                <button
                  onClick={() => navigate(`/student/assignments/${id}/submit`)}
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
                  Submit Assignment
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignmentDetail;
