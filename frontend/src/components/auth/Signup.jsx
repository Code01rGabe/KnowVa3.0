import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    schoolCode: '',
    teacherCode: '',
    studentCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    // Clear code fields when role changes
    setFormData({
      ...formData,
      schoolCode: '',
      teacherCode: '',
      studentCode: '',
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!role) {
      setError('Please select a role');
      return;
    }

    setError('');
    setLoading(true);

    const result = await register({
      ...formData,
      role,
    });

    if (result.success) {
      // Redirect based on role
      switch (role) {
        case 'schoolRep':
          navigate('/school-rep/dashboard');
          break;
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      setError(result.message || 'Registration failed');
      if (result.errors) {
        const errorMessages = result.errors.map(err => err.msg).join(', ');
        setError(errorMessages);
      }
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '50px' }}>
      <div className="card">
        <h2 style={{ marginBottom: '30px', textAlign: 'center', fontSize: '28px' }}>Sign Up</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="form-group">
            <label style={{ marginBottom: '15px', fontSize: '18px' }}>Select Your Role</label>
            <div className="role-selection">
              <div 
                className={`role-box ${role === 'schoolRep' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('schoolRep')}
              >
                <input
                  type="radio"
                  name="role"
                  value="schoolRep"
                  checked={role === 'schoolRep'}
                  onChange={() => handleRoleSelect('schoolRep')}
                />
                <label>School Representative</label>
              </div>
              <div 
                className={`role-box ${role === 'teacher' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('teacher')}
              >
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={role === 'teacher'}
                  onChange={() => handleRoleSelect('teacher')}
                />
                <label>Teacher</label>
              </div>
              <div 
                className={`role-box ${role === 'student' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('student')}
              >
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === 'student'}
                  onChange={() => handleRoleSelect('student')}
                />
                <label>Student</label>
              </div>
            </div>
          </div>

          {/* Common Fields */}
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Enter password (min 6 characters)"
            />
          </div>

          {/* Role-specific Code Fields */}
          {role === 'schoolRep' && (
            <div className="form-group">
              <label>School Code</label>
              <input
                type="text"
                name="schoolCode"
                value={formData.schoolCode}
                onChange={handleChange}
                required
                placeholder="Enter school code provided by admin"
              />
            </div>
          )}

          {role === 'teacher' && (
            <div className="form-group">
              <label>Teacher Code</label>
              <input
                type="text"
                name="teacherCode"
                value={formData.teacherCode}
                onChange={handleChange}
                required
                placeholder="Enter teacher code provided by school rep"
              />
            </div>
          )}

          {role === 'student' && (
            <div className="form-group">
              <label>Student Code</label>
              <input
                type="text"
                name="studentCode"
                value={formData.studentCode}
                onChange={handleChange}
                required
                placeholder="Enter student code provided by school rep"
              />
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px' }} 
            disabled={loading || !role}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ marginTop: '25px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
