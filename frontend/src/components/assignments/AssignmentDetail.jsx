import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
    return <div className="container">Loading...</div>;
  }

  if (!assignment) {
    return <div className="container">Assignment not found</div>;
  }

  const isPastDue = new Date(assignment.dueDate) < new Date();

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="card">
        <h1>{assignment.title}</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>{assignment.description}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <p><strong>Course:</strong> {assignment.courseId?.title}</p>
          <p><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleString()}</p>
          <p><strong>Max Points:</strong> {assignment.maxPoints}</p>
          {isPastDue && <p style={{ color: '#dc3545' }}><strong>Status:</strong> Past Due</p>}
        </div>
      </div>

      {user?.role === 'teacher' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Submissions</h2>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/teacher/assignments/${id}/submissions`)}
            >
              View All Submissions
            </button>
          </div>
        </div>
      )}

      {user?.role === 'student' && (
        <div className="card">
          <h2>My Submission</h2>
          {submission ? (
            <div>
              <p><strong>Status:</strong> {submission.status === 'graded' ? 'Graded' : 'Pending'}</p>
              {submission.grade !== null && (
                <p><strong>Grade:</strong> {submission.grade} / {assignment.maxPoints}</p>
              )}
              {submission.feedback && (
                <div>
                  <p><strong>Feedback:</strong></p>
                  <p>{submission.feedback}</p>
                </div>
              )}
              <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/student/assignments/${id}/submit`)}
                style={{ marginTop: '10px' }}
              >
                {submission.status === 'graded' ? 'Resubmit' : 'Update Submission'}
              </button>
            </div>
          ) : (
            <div>
              <p>You haven't submitted this assignment yet.</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/student/assignments/${id}/submit`)}
                style={{ marginTop: '10px' }}
              >
                Submit Assignment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentDetail;

