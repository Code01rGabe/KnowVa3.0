import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import api from '../../utils/api';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'classes', label: 'Classes & Streams' },
  { id: 'subjects', label: 'Subjects & Materials' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'School Settings' },
  { id: 'communications', label: 'Communications' },
];

const SchoolRepDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [school, setSchool] = useState(null);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [classroomForm, setClassroomForm] = useState({ name: '', description: '', level: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '', code: '' });
  const [attendanceJson, setAttendanceJson] = useState('[]');
  const [settingsForm, setSettingsForm] = useState({
    branding: { platformName: '', logoUrl: '', primaryColor: '#ff6600', secondaryColor: '#2d1b3d', motto: '' },
    gradingSystem: 'percentage',
  });
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSchoolData(),
        loadStats(),
        loadPeople(),
        loadClassrooms(),
        loadSubjects(),
        loadMaterials(),
        loadAttendance(),
        loadAnalytics(),
        loadSettings(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadSchoolData = async () => {
    const response = await api.get('/school');
    setSchool(response.data.school);
  };

  const loadStats = async () => {
    const response = await api.get('/school/stats');
    setStats(response.data.stats);
  };

  const loadPeople = async () => {
    const [studentsRes, teachersRes] = await Promise.all([api.get('/school/students'), api.get('/school/teachers')]);
    setStudents(studentsRes.data.students || []);
    setTeachers(teachersRes.data.teachers || []);
  };

  const loadClassrooms = async () => {
    try {
      const response = await api.get('/school/classrooms');
      const classrooms = response.data.data || [];
      // Ensure we have the latest data with populated teachers and students
      setClassrooms(classrooms);
    } catch (error) {
      console.error('Error loading classrooms:', error);
      setMessage('Error loading classrooms');
    }
  };

  const loadSubjects = async () => {
    const response = await api.get('/school/subjects');
    setSubjects(response.data.data || []);
  };

  const loadMaterials = async () => {
    const response = await api.get('/school/materials');
    setMaterials(response.data.data || []);
  };

  const loadAttendance = async () => {
    const response = await api.get('/school/attendance');
    setAttendance(response.data.data || []);
  };

  const loadAnalytics = async () => {
    const response = await api.get('/school/analytics');
    setAnalytics(response.data);
  };

  const loadSettings = async () => {
    const response = await api.get('/school/settings');
    setSettings(response.data.settings);
    setSettingsForm({
      branding: {
        platformName: response.data.settings?.branding?.platformName || response.data.settings?.name || 'Our School',
        logoUrl: response.data.settings?.branding?.logoUrl || '',
        primaryColor: response.data.settings?.branding?.primaryColor || '#ff6600',
        secondaryColor: response.data.settings?.branding?.secondaryColor || '#2d1b3d',
        motto: response.data.settings?.branding?.motto || '',
      },
      gradingSystem: response.data.settings?.gradingSystem || 'percentage',
    });
  };

  const regenerateCode = async (type) => {
    try {
      await api.post(`/school/regenerate-${type}-code`);
      setMessage(`${type === 'teacher' ? 'Teacher' : 'Student'} code regenerated`);
      loadSchoolData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to regenerate code');
    }
  };

  const createClassroom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/school/classrooms', classroomForm);
      setClassroomForm({ name: '', description: '', level: '' });
      loadClassrooms();
      setMessage('Classroom saved');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save classroom');
    }
  };

  const createSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/school/subjects', subjectForm);
      setSubjectForm({ name: '', description: '', code: '' });
      loadSubjects();
      setMessage('Subject saved');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save subject');
    }
  };

  const toggleSubject = async (subjectId) => {
    await api.post(`/school/subjects/${subjectId}/toggle`);
    loadSubjects();
  };

  const updateMaterialStatus = async (materialId, status) => {
    await api.post(`/school/materials/${materialId}/status`, { status });
    loadMaterials();
  };

  const handleEnroll = async (classroomId, studentId, selectElement) => {
    if (!studentId) return;
    try {
      setMessage('');
      const response = await api.post(`/school/classrooms/${classroomId}/enroll`, { studentId });
      setMessage('Student enrolled successfully');
      if (selectElement) selectElement.value = '';
      // Force a refresh of classrooms to get updated data
      await loadClassrooms();
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Enrollment error:', error);
      setMessage(error.response?.data?.message || 'Error enrolling student');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleAddTeacher = async (classroomId, teacherId, selectElement) => {
    if (!teacherId) return;
    try {
      setMessage('');
      const response = await api.post(`/school/classrooms/${classroomId}/add-teacher`, { teacherId });
      setMessage('Teacher added successfully');
      if (selectElement) selectElement.value = '';
      // Force a refresh of classrooms to get updated data
      await loadClassrooms();
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Add teacher error:', error);
      setMessage(error.response?.data?.message || 'Error adding teacher');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const recordAttendance = async (e) => {
    e.preventDefault();
    try {
      const records = JSON.parse(attendanceJson).map((record) => ({
        ...record,
        date: record.date || new Date().toISOString().slice(0, 10),
      }));
      await api.post('/school/attendance', { records });
      setMessage('Attendance recorded');
      setAttendanceJson('[]');
      loadAttendance();
    } catch (error) {
      setMessage('Please provide valid JSON attendance records');
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    await api.patch('/school/settings', settingsForm);
    setMessage('Settings updated');
    loadSettings();
  };

  const handleAnnouncement = (e) => {
    e.preventDefault();
    setMessage('Announcement sent (mock)');
    setAnnouncement({ title: '', message: '' });
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

  const statCards = stats
    ? [
        { label: 'Students', value: stats.students },
        { label: 'Teachers', value: stats.teachers },
        { label: 'Courses', value: stats.courses },
        { label: 'Assignments', value: stats.assignments },
        { label: 'Pending Submissions', value: stats.pendingSubmissions },
      ]
    : [];

  const renderOverview = () => (
    <>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        {statCards.map((card, index) => {
          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
          return (
            <div
              key={card.label}
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                padding: '20px',
                border: '1px solid #e2e8f0',
              }}
            >
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                {card.label}
              </p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
                {card.value ?? 0}
              </p>
            </div>
          );
        })}
      </div>

      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        padding: '24px',
        border: '1px solid #e2e8f0',
      }}>
        <h2>Registration Codes</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div className="glass-card stats-card">
            <h3>Teacher Code</h3>
            <div className="value">{school?.teacherCode || 'Not generated'}</div>
            <button className="btn btn-primary" onClick={() => regenerateCode('teacher')} style={{ marginTop: 10 }}>
              {school?.teacherCode ? 'Regenerate' : 'Generate'}
            </button>
          </div>
          <div className="glass-card stats-card">
            <h3>Student Code</h3>
            <div className="value">{school?.studentCode || 'Not generated'}</div>
            <button className="btn btn-primary" onClick={() => regenerateCode('student')} style={{ marginTop: 10 }}>
              {school?.studentCode ? 'Regenerate' : 'Generate'}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderClasses = () => (
    <div>
      <h2>Classrooms & Streams</h2>
      <form onSubmit={createClassroom}>
        <div className="form-group">
          <label>Name</label>
          <input value={classroomForm.name} onChange={(e) => setClassroomForm((prev) => ({ ...prev, name: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={classroomForm.description} onChange={(e) => setClassroomForm((prev) => ({ ...prev, description: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Level/Grade</label>
          <input value={classroomForm.level} onChange={(e) => setClassroomForm((prev) => ({ ...prev, level: e.target.value }))} />
        </div>
        <button className="btn btn-primary">Save Classroom</button>
      </form>
      <div style={{ marginTop: 20, overflowX: 'auto' }}>
        <table className="list-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Level</th>
              <th>Teachers</th>
              <th>Students</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classrooms.map((classroom) => (
              <tr key={classroom._id}>
                <td>{classroom.name}</td>
                <td>{classroom.level}</td>
                <td>{classroom.teachers?.length || 0}</td>
                <td>{classroom.students?.length || 0}</td>
                <td style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        handleEnroll(classroom._id, e.target.value, e.target);
                      }
                    }} 
                    defaultValue=""
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}
                  >
                    <option value="">Enroll student</option>
                    {students
                      .filter((student) => !classroom.students?.some((s) => (s._id || s).toString() === student._id.toString()))
                      .map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.profile?.name || student.email}
                        </option>
                      ))}
                  </select>
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddTeacher(classroom._id, e.target.value, e.target);
                      }
                    }} 
                    defaultValue=""
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}
                  >
                    <option value="">Add teacher</option>
                    {teachers
                      .filter((teacher) => !classroom.teachers?.some((t) => (t._id || t).toString() === teacher._id.toString()))
                      .map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.profile?.name || teacher.email}
                        </option>
                      ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSubjects = () => (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h2>Subjects</h2>
        <form onSubmit={createSubject}>
          <div className="form-group">
            <label>Name</label>
            <input value={subjectForm.name} onChange={(e) => setSubjectForm((prev) => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={subjectForm.description} onChange={(e) => setSubjectForm((prev) => ({ ...prev, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Code</label>
            <input value={subjectForm.code} onChange={(e) => setSubjectForm((prev) => ({ ...prev, code: e.target.value }))} />
          </div>
          <button className="btn btn-primary">Save Subject</button>
        </form>
        <div style={{ marginTop: 20 }}>
          <table className="list-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject._id}>
                  <td>{subject.name}</td>
                  <td>{subject.code}</td>
                  <td>{subject.active ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button className="btn outline-button" onClick={() => toggleSubject(subject._id)}>
                      {subject.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>Learning Materials</h2>
        <table className="list-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Uploader</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => (
              <tr key={material._id}>
                <td>{material.title}</td>
                <td>{material.subjectId?.name || '—'}</td>
                <td>{material.uploadedBy?.profile?.name || material.uploadedBy?.email}</td>
                <td>{material.status}</td>
                <td style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn outline-button" onClick={() => updateMaterialStatus(material._id, 'approved')}>
                    Approve
                  </button>
                  <button className="btn outline-button" onClick={() => updateMaterialStatus(material._id, 'rejected')}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderAttendance = () => (
    <div>
      <h2>Attendance</h2>
      <form onSubmit={recordAttendance}>
        <div className="form-group">
          <label>Records (JSON array)</label>
          <textarea
            placeholder='[{"studentId":"...", "classroomId":"...", "status":"present"}]'
            value={attendanceJson}
            onChange={(e) => setAttendanceJson(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary">Record Attendance</button>
      </form>
      <div style={{ marginTop: 20 }}>
        <table className="list-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Classroom</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.slice(0, 20).map((record) => (
              <tr key={record._id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.studentId?.profile?.name}</td>
                <td>{record.classroomId?.name || '—'}</td>
                <td>{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <h2>School Analytics</h2>
      {analytics ? (
        <>
          <div className="stats-grid">
            <div className="stats-card glass-card">
              <h3>Total Submissions</h3>
              <div className="value">{analytics.submissions?.length || 0}</div>
            </div>
            <div className="stats-card glass-card">
              <h3>Recent Attendance Entries</h3>
              <div className="value">{analytics.attendance?.length || 0}</div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <h3>Recent Attendance</h3>
            <ul>
              {analytics.attendance?.slice(0, 5).map((record) => (
                <li key={record._id}>
                  {new Date(record.date).toLocaleDateString()} · {record.studentId} · {record.status}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p>No analytics yet.</p>
      )}
    </div>
  );

  const renderSettings = () => (
    <div>
      <h2>School Settings</h2>
      <form onSubmit={saveSettings}>
        <div className="form-group">
          <label>Platform Name</label>
          <input
            value={settingsForm.branding.platformName}
            onChange={(e) => setSettingsForm((prev) => ({ ...prev, branding: { ...prev.branding, platformName: e.target.value } }))}
            required
          />
        </div>
        <div className="form-group">
          <label>Logo URL</label>
          <input
            value={settingsForm.branding.logoUrl}
            onChange={(e) => setSettingsForm((prev) => ({ ...prev, branding: { ...prev.branding, logoUrl: e.target.value } }))}
          />
        </div>
        <div className="form-group">
          <label>Primary Color</label>
          <input
            type="color"
            value={settingsForm.branding.primaryColor}
            onChange={(e) => setSettingsForm((prev) => ({ ...prev, branding: { ...prev.branding, primaryColor: e.target.value } }))}
          />
        </div>
        <div className="form-group">
          <label>Secondary Color</label>
          <input
            type="color"
            value={settingsForm.branding.secondaryColor}
            onChange={(e) => setSettingsForm((prev) => ({ ...prev, branding: { ...prev.branding, secondaryColor: e.target.value } }))}
          />
        </div>
        <div className="form-group">
          <label>Grading System</label>
          <select
            value={settingsForm.gradingSystem}
            onChange={(e) => setSettingsForm((prev) => ({ ...prev, gradingSystem: e.target.value }))}
          >
            <option value="percentage">Percentage</option>
            <option value="gpa">GPA</option>
            <option value="letter">Letter Grades</option>
          </select>
        </div>
        <button className="btn btn-primary">Save Settings</button>
      </form>
    </div>
  );

  const renderCommunications = () => (
    <div>
      <h2>Announcements & Support</h2>
      <form onSubmit={handleAnnouncement}>
        <div className="form-group">
          <label>Announcement Title</label>
          <input value={announcement.title} onChange={(e) => setAnnouncement((prev) => ({ ...prev, title: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea
            value={announcement.message}
            onChange={(e) => setAnnouncement((prev) => ({ ...prev, message: e.target.value }))}
            required
          />
        </div>
        <button className="btn btn-primary">Send Announcement</button>
      </form>
      <p style={{ marginTop: 20, color: 'var(--text-secondary)' }}>
        Support tickets, device usage, and compliance monitoring will appear here once connected to the relevant services.
      </p>
    </div>
  );

  const tabContent = {
    overview: renderOverview(),
    classes: renderClasses(),
    subjects: renderSubjects(),
    attendance: renderAttendance(),
    analytics: renderAnalytics(),
    settings: renderSettings(),
    communications: renderCommunications(),
  };

  return (
    <DashboardLayout>
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            {school?.name || 'Your School'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Manage classes, subjects, attendance, analytics, and communications.
          </p>
        </div>

        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              backgroundColor: message.toLowerCase().includes('unable') || message.toLowerCase().includes('error')
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(16, 185, 129, 0.1)',
              color: message.toLowerCase().includes('unable') || message.toLowerCase().includes('error')
                ? '#dc2626'
                : '#059669',
              border: `1px solid ${message.toLowerCase().includes('unable') || message.toLowerCase().includes('error') ? '#fecaca' : '#a7f3d0'}`,
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

export default SchoolRepDashboard;

