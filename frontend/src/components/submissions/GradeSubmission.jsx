import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

const GradeSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [formData, setFormData] = useState({
    grade: '',
    feedback: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSubmission();
  }, [id]);

  const loadSubmission = async () => {
    try {
      const response = await api.get(`/submissions/${id}`);
      const sub = response.data.submission;
      setSubmission(sub);
      setFormData({
        grade: sub.grade !== null && sub.grade !== undefined ? sub.grade.toString() : '',
        feedback: sub.feedback || '',
      });
    } catch (error) {
      console.error('Error loading submission:', error);
      setError('Error loading submission');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.put(`/submissions/${id}/grade`, {
        grade: parseFloat(formData.grade),
        feedback: formData.feedback,
      });
      setMessage('Submission graded successfully!');
      setTimeout(() => {
        navigate(`/teacher/assignments/${submission.assignmentId._id}/submissions`);
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Error grading submission');
    } finally {
      setLoading(false);
    }
  };

  if (!submission) {
    return <div className="container">Loading...</div>;
  }

  const maxPoints = submission.assignmentId?.maxPoints || 100;

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <h1 style={{ marginBottom: '20px' }}>Grade Submission</h1>
      
      <div className="card">
        <h2>Assignment: {submission.assignmentId?.title}</h2>
        <p><strong>Student:</strong> {submission.studentId?.profile?.name || submission.studentId?.email}</p>
        <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
          <p><strong>Submission Content:</strong></p>
          <p style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
            {submission.content || 'No content provided'}
          </p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Grade (out of {maxPoints})</label>
            <input
              type="number"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              required
              min="0"
              max={maxPoints}
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label>Feedback</label>
            <textarea
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              rows="5"
              placeholder="Provide feedback to the student..."
            />
          </div>
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Grading...' : 'Submit Grade'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradeSubmission;

