import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

const SubmissionList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [assignmentRes, submissionsRes] = await Promise.all([
        api.get(`/assignments/${id}`),
        api.get(`/submissions?assignmentId=${id}`),
      ]);
      setAssignment(assignmentRes.data.assignment);
      setSubmissions(submissionsRes.data.submissions);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <h1 style={{ marginBottom: '20px' }}>Submissions: {assignment?.title}</h1>

      {submissions.length === 0 ? (
        <div className="card">
          <p>No submissions yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {submissions.map((submission) => (
            <div key={submission._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ marginBottom: '10px' }}>
                    {submission.studentId?.profile?.name || submission.studentId?.email}
                  </h2>
                  <p style={{ color: '#666', marginBottom: '10px' }}>
                    {submission.content || 'No content provided'}
                  </p>
                  <p style={{ fontSize: '14px', color: '#888' }}>
                    Submitted: {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                  <p style={{ fontSize: '14px', color: '#888' }}>
                    Status: <strong>{submission.status === 'graded' ? 'Graded' : 'Pending'}</strong>
                  </p>
                  {submission.grade !== null && (
                    <p style={{ fontSize: '14px', color: '#888' }}>
                      Grade: <strong>{submission.grade} / {assignment.maxPoints}</strong>
                    </p>
                  )}
                </div>
                <div>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/teacher/submissions/${submission._id}/grade`)}
                  >
                    {submission.status === 'graded' ? 'Update Grade' : 'Grade'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionList;

