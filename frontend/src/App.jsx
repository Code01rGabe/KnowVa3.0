import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';
import Notification from './components/Notification';
import LandingPage from './components/landing/LandingPage';

// Auth components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

// Dashboard components
import AdminDashboard from './components/dashboard/AdminDashboard';
import SchoolRepDashboard from './components/dashboard/SchoolRepDashboard';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import StudentDashboard from './components/dashboard/StudentDashboard';
import ManageSchools from './components/admin/ManageSchools';
import ManageUsers from './components/admin/ManageUsers';

// Class components
import ClassDetail from './components/classes/ClassDetail';
import StudentProfile from './components/classes/StudentProfile';

// Course components
import CourseList from './components/courses/CourseList';
import CourseForm from './components/courses/CourseForm';
import CourseDetail from './components/courses/CourseDetail';

// Assignment components
import AssignmentList from './components/assignments/AssignmentList';
import AssignmentForm from './components/assignments/AssignmentForm';
import AssignmentDetail from './components/assignments/AssignmentDetail';

// Submission components
import SubmissionForm from './components/submissions/SubmissionForm';
import SubmissionList from './components/submissions/SubmissionList';
import GradeSubmission from './components/submissions/GradeSubmission';

// Settings components
import AccountSettings from './components/settings/AccountSettings';

// Suppress React Router future flag warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' && 
    args[0].includes('React Router Future Flag Warning')
  ) {
    return; 
  }
  originalWarn.apply(console, args);
};

const Home = () => {
  const { user } = useAuth();

  if (!user) {
    return <LandingPage />;
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'schoolRep':
      return <Navigate to="/school-rep/dashboard" replace />;
    case 'teacher':
      return <Navigate to="/teacher/dashboard" replace />;
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    default:
      return <LandingPage />;
  }
};

function App() {
  return (
    <AuthProvider>
      <ThemeToggle />
      <Notification />
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schools"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageSchools />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />

          {/* School Rep Routes */}
          <Route
            path="/school-rep/dashboard"
            element={
              <ProtectedRoute allowedRoles={['schoolRep']}>
                <SchoolRepDashboard />
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/courses"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <CourseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/courses/new"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <CourseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/courses/:id"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/courses/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <CourseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/assignments"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <AssignmentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/assignments/new"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <AssignmentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/assignments/:id"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <AssignmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/assignments/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <AssignmentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/assignments/:id/submissions"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <SubmissionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/submissions/:id/grade"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <GradeSubmission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/classes/:classroomId"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ClassDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/students/:studentId"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CourseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses/:id"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assignments"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AssignmentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assignments/:id"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AssignmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assignments/:id/submit"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <SubmissionForm />
              </ProtectedRoute>
            }
          />

          {/* Settings Routes - Available to all authenticated users */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['admin', 'schoolRep', 'teacher', 'student']}>
                <AccountSettings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;