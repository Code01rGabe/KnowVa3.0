const express = require('express');
const router = express.Router();
const {
  getTeacherClassrooms,
  getClassroomDetails,
  recordClassroomAttendance,
  getClassroomAttendance,
  getStudentProfile,
  getClassroomAnalytics,
} = require('../controllers/teacherClassController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Get all classrooms for teacher
router.get(
  '/classrooms',
  authenticate,
  roleCheck('teacher'),
  getTeacherClassrooms
);

// Get single classroom details
router.get(
  '/classrooms/:classroomId',
  authenticate,
  roleCheck('teacher'),
  getClassroomDetails
);

// Get classroom analytics
router.get(
  '/classrooms/:classroomId/analytics',
  authenticate,
  roleCheck('teacher'),
  getClassroomAnalytics
);

// Record attendance
router.post(
  '/classrooms/:classroomId/attendance',
  authenticate,
  roleCheck('teacher'),
  recordClassroomAttendance
);

// Get attendance records
router.get(
  '/classrooms/:classroomId/attendance',
  authenticate,
  roleCheck('teacher'),
  getClassroomAttendance
);

// Get student profile
router.get(
  '/students/:studentId',
  authenticate,
  roleCheck('teacher'),
  getStudentProfile
);

module.exports = router;

