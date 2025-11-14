import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';

const AssignmentForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: searchParams.get('courseId') || '',
    dueDate: '',
    maxPoints: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourses();
    if (id) {
      loadAssignment();
    }
  }, [id]);

  const loadCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadAssignment = async () => {
    try {
      const response = await api.get(`/assignments/${id}`);
      const assignment = response.data.assignment;
      setFormData({
        title: assignment.title,
        description: assignment.description || '',
        courseId: assignment.courseId._id,
        dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
        maxPoints: assignment.maxPoints.toString(),
      });
    } catch (error) {
      console.error('Error loading assignment:', error);
      setError('Error loading assignment');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        maxPoints: parseInt(formData.maxPoints),
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      if (id) {
        await api.put(`/assignments/${id}`, submitData);
      } else {
        await api.post('/assignments', submitData);
      }
      navigate('/teacher/assignments');
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '20px' }}>{id ? 'Edit Assignment' : 'Create New Assignment'}</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course</label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
              disabled={!!id}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Assignment Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
            />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Maximum Points</label>
            <input
              type="number"
              name="maxPoints"
              value={formData.maxPoints}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          {error && <div className="error">{error}</div>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : id ? 'Update Assignment' : 'Create Assignment'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/teacher/assignments')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm;

