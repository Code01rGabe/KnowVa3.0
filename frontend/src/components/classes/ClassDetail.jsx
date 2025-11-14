import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import api from '../../utils/api';

const ClassDetail = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students');
  const [classroom, setClassroom] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Attendance state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});

  useEffect(() => {
    loadClassroomData();
  }, [classroomId]);

  const loadClassroomData = async () => {
    try {
      setLoading(true);
      const [classroomRes, attendanceRes, analyticsRes] = await Promise.all([
        api.get(`/teacher/classrooms/${classroomId}`),
        api.get(`/teacher/classrooms/${classroomId}/attendance`),
        api.get(`/teacher/classrooms/${classroomId}/analytics`),
      ]);

      setClassroom(classroomRes.data.classroom);
      setAttendance(attendanceRes.data.attendance || []);
      setAnalytics(analyticsRes.data.analytics);

      // Initialize attendance records for today
      if (classroomRes.data.classroom?.students) {
        const initialRecords = {};
        classroomRes.data.classroom.students.forEach((student) => {
          const studentId = student._id || student;
          initialRecords[studentId] = 'present';
        });
        setAttendanceRecords(initialRecords);
      }
    } catch (error) {
      console.error('Error loading classroom data:', error);
      setMessage('Error loading classroom data');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAttendance = async (e) => {
    e.preventDefault();
    try {
      const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      await api.post(`/teacher/classrooms/${classroomId}/attendance`, {
        date: attendanceDate,
        records,
      });

      setMessage('Attendance recorded successfully!');
      setTimeout(() => setMessage(''), 3000);
      loadClassroomData();
    } catch (error) {
      console.error('Error recording attendance:', error);
      setMessage('Error recording attendance');
    }
  };

  const handleAttendanceStatusChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
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

  if (!classroom) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <p>Classroom not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'students', label: 'Students' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'analytics', label: 'Analytics' },
  ];

  const renderStudents = () => (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>Student List</h2>
      {classroom.students?.length ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classroom.students.map((student) => {
                const studentId = student._id || student;
                return (
                  <tr key={studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#1e293b' }}>{student.profile?.name || student.email}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>{student.email}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => navigate(`/teacher/students/${studentId}`)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '13px',
                          backgroundColor: 'transparent',
                          color: '#ff6600',
                          border: '1px solid #ff6600',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: '#64748b', fontSize: '14px' }}>No students enrolled in this class.</p>
      )}
    </div>
  );

  const renderAttendance = () => (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>Take Attendance</h2>
      <form onSubmit={handleRecordAttendance} style={{ marginBottom: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '8px' }}>Date</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
            }}
          />
        </div>
        {classroom.students?.length ? (
          <>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Mark Attendance</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {classroom.students.map((student) => {
                  const studentId = student._id || student;
                  return (
                    <div key={studentId} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                      <span style={{ flex: 1, fontSize: '14px', color: '#1e293b' }}>{student.profile?.name || student.email}</span>
                      <select
                        value={attendanceRecords[studentId] || 'present'}
                        onChange={(e) => handleAttendanceStatusChange(studentId, e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              type="submit"
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
              Record Attendance
            </button>
          </>
        ) : (
          <p style={{ color: '#64748b', fontSize: '14px' }}>No students in this class.</p>
        )}
      </form>

      <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>Recent Attendance Records</h3>
        {attendance.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Student</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 20).map((record) => (
                  <tr key={record._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#1e293b' }}>{new Date(record.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#1e293b' }}>{record.studentId?.profile?.name || record.studentId?.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor:
                            record.status === 'present'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : record.status === 'absent'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(245, 158, 11, 0.15)',
                          color:
                            record.status === 'present'
                              ? '#059669'
                              : record.status === 'absent'
                              ? '#dc2626'
                              : '#d97706',
                        }}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '14px' }}>No attendance records yet.</p>
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>Class Analytics</h2>
      {analytics ? (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              padding: '20px',
              border: '1px solid #e2e8f0',
            }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>Average Score</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{analytics.averageScore ?? 'N/A'}</p>
            </div>
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              padding: '20px',
              border: '1px solid #e2e8f0',
            }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>Completion Rate</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{analytics.completionRate}%</p>
            </div>
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              padding: '20px',
              border: '1px solid #e2e8f0',
            }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>Attendance Rate</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{analytics.attendanceRate}%</p>
            </div>
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              padding: '20px',
              border: '1px solid #e2e8f0',
            }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>Total Assignments</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{analytics.totalAssignments}</p>
            </div>
          </div>

          {analytics.strugglingStudents?.length > 0 && (
            <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Students Needing Support</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analytics.strugglingStudents.map((student) => (
                  <div key={student.studentId} style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{student.name}</p>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Average Grade: <strong style={{ color: '#dc2626' }}>{student.averageGrade}</strong></p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: '#64748b', fontSize: '14px' }}>No analytics data available yet.</p>
      )}
    </div>
  );

  const tabContent = {
    students: renderStudents(),
    attendance: renderAttendance(),
    analytics: renderAnalytics(),
  };

  return (
    <DashboardLayout>
      <div>
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/teacher/dashboard')}
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
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            {classroom.name}
          </h1>
          {classroom.level && <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '4px' }}>Level: {classroom.level}</p>}
          {classroom.description && <p style={{ color: '#64748b', fontSize: '16px' }}>{classroom.description}</p>}
        </div>

        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              backgroundColor: message.toLowerCase().includes('error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: message.toLowerCase().includes('error') ? '#dc2626' : '#059669',
              border: `1px solid ${message.toLowerCase().includes('error') ? '#fecaca' : '#a7f3d0'}`,
            }}
          >
            {message}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid #e2e8f0',
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: activeTab === tab.id ? '#ff6600' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#64748b',
                border: `1px solid ${activeTab === tab.id ? '#ff6600' : '#e2e8f0'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.borderColor = '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#e2e8f0';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
        }}>
          {tabContent[activeTab]}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassDetail;

