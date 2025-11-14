import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

const SubmissionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [formData, setFormData] = useState({
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAssignment();
    loadExistingSubmission();
  }, [id]);

  const loadAssignment = async () => {
    try {
      const response = await api.get(`/assignments/${id}`);
      setAssignment(response.data.assignment);
    } catch (error) {
      console.error('Error loading assignment:', error);
      setError('Error loading assignment');
    }
  };

  const loadExistingSubmission = async () => {
    try {
      const response = await api.get(`/submissions/assignment/${id}`);
      setFormData({
        content: response.data.submission.content || '',
      });
    } catch (error) {
      // Submission doesn't exist yet, that's fine
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
      await api.post('/submissions', {
        assignmentId: id,
        content: formData.content,
      });
      setMessage('Assignment submitted successfully!');
      setTimeout(() => {
        navigate(`/student/assignments/${id}`);
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting assignment');
    } finally {
      setLoading(false);
    }
  };

  if (!assignment) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <h1 style={{ marginBottom: '20px' }}>Submit Assignment: {assignment.title}</h1>
      
      <div className="card">
        <p><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleString()}</p>
        <p><strong>Max Points:</strong> {assignment.maxPoints}</p>
        {assignment.description && (
          <div style={{ marginTop: '15px', marginBottom: '15px' }}>
            <p><strong>Description:</strong></p>
            <p>{assignment.description}</p>
          </div>
        )}
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Submission Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="10"
              placeholder="Enter your submission here..."
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Assignment'}
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

export default SubmissionForm;

