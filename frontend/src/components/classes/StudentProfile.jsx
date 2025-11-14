import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import api from '../../utils/api';

const StudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teacher/students/${studentId}`);
      setStudent(response.data.student);
      setSubmissions(response.data.submissions || []);
      setAttendance(response.data.attendance || []);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
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

  if (!student) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <p>Student not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const gradedSubmissions = submissions.filter((s) => s.grade !== null && s.grade !== undefined);

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
            {student.profile?.name || student.email}
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Student Profile & Academic History</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>Average Grade</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>{statistics?.averageGrade ?? 'N/A'}</p>
          </div>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>Total Submissions</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>{statistics?.totalSubmissions || 0}</p>
          </div>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>Graded</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>{statistics?.gradedSubmissions || 0}</p>
          </div>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>Pending</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>{statistics?.pendingSubmissions || 0}</p>
          </div>
        </div>

        {statistics?.attendanceStats && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>Attendance Statistics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Total Records</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{statistics.attendanceStats.total}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Present</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>
                  {statistics.attendanceStats.present}
                </p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Absent</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#dc2626' }}>
                  {statistics.attendanceStats.absent}
                </p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Late</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#d97706' }}>
                  {statistics.attendanceStats.late}
                </p>
              </div>
            </div>
          </div>
        )}

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>Academic History</h2>
          {submissions.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Assignment</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Course</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Grade</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#1e293b' }}>{submission.assignmentId?.title || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>{submission.assignmentId?.courseId?.title || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor:
                              submission.status === 'graded'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : submission.status === 'pending'
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'rgba(200, 200, 200, 0.15)',
                            color:
                              submission.status === 'graded'
                                ? '#059669'
                                : submission.status === 'pending'
                                ? '#d97706'
                                : '#64748b',
                          }}
                        >
                          {submission.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#1e293b' }}>
                        {submission.grade !== null && submission.grade !== undefined
                          ? `${submission.grade}${submission.assignmentId?.maxPoints ? ` / ${submission.assignmentId.maxPoints}` : ''}`
                          : '—'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>{new Date(submission.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '14px' }}>No submissions yet.</p>
          )}
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>Recent Attendance</h2>
          {attendance.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Classroom</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice(0, 30).map((record) => (
                    <tr key={record._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#1e293b' }}>{new Date(record.date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>{record.classroomId?.name || '—'}</td>
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
    </DashboardLayout>
  );
};

export default StudentProfile;

