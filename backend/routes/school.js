const express = require('express');
const router = express.Router();
const {
  getSchool,
  regenerateTeacherCode,
  regenerateStudentCode,
  getSchoolStats,
  getSchoolStudents,
  getSchoolTeachers,
} = require('../controllers/schoolController');
const {
  listClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  enrollStudent,
  removeStudent,
  addTeacher,
  removeTeacher,
  listSubjects,
  createSubject,
  updateSubject,
  toggleSubject,
  listMaterials,
  updateMaterialStatus,
  recordAttendance,
  listAttendance,
  getSchoolAnalytics,
  getSchoolSettings,
  updateSchoolSettings,
} = require('../controllers/schoolAdminController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Routes
router.get(
  '/',
  authenticate,
  roleCheck('schoolRep'),
  getSchool
);

router.post(
  '/regenerate-teacher-code',
  authenticate,
  roleCheck('schoolRep'),
  regenerateTeacherCode
);

router.post(
  '/regenerate-student-code',
  authenticate,
  roleCheck('schoolRep'),
  regenerateStudentCode
);

router.get(
  '/stats',
  authenticate,
  roleCheck('schoolRep'),
  getSchoolStats
);

router.get(
  '/students',
  authenticate,
  roleCheck('schoolRep', 'teacher'),
  getSchoolStudents
);
router.get(
  '/teachers',
  authenticate,
  roleCheck('schoolRep'),
  getSchoolTeachers
);

// School admin management routes
router.get('/classrooms', authenticate, roleCheck('schoolRep'), listClassrooms);
router.post('/classrooms', authenticate, roleCheck('schoolRep'), createClassroom);
router.patch('/classrooms/:classroomId', authenticate, roleCheck('schoolRep'), updateClassroom);
router.delete('/classrooms/:classroomId', authenticate, roleCheck('schoolRep'), deleteClassroom);
router.post('/classrooms/:classroomId/enroll', authenticate, roleCheck('schoolRep'), enrollStudent);
router.post('/classrooms/:classroomId/remove-student', authenticate, roleCheck('schoolRep'), removeStudent);
router.post('/classrooms/:classroomId/add-teacher', authenticate, roleCheck('schoolRep'), addTeacher);
router.post('/classrooms/:classroomId/remove-teacher', authenticate, roleCheck('schoolRep'), removeTeacher);

router.get('/subjects', authenticate, roleCheck('schoolRep'), listSubjects);
router.post('/subjects', authenticate, roleCheck('schoolRep'), createSubject);
router.patch('/subjects/:subjectId', authenticate, roleCheck('schoolRep'), updateSubject);
router.post('/subjects/:subjectId/toggle', authenticate, roleCheck('schoolRep'), toggleSubject);

router.get('/materials', authenticate, roleCheck('schoolRep'), listMaterials);
router.post(
  '/materials/:materialId/status',
  authenticate,
  roleCheck('schoolRep'),
  updateMaterialStatus
);

router.post('/attendance', authenticate, roleCheck('schoolRep'), recordAttendance);
router.get('/attendance', authenticate, roleCheck('schoolRep'), listAttendance);

router.get('/analytics', authenticate, roleCheck('schoolRep'), getSchoolAnalytics);
router.get('/settings', authenticate, roleCheck('schoolRep'), getSchoolSettings);
router.patch('/settings', authenticate, roleCheck('schoolRep'), updateSchoolSettings);

module.exports = router;

