const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  generateSchoolCode,
  getAllSchools,
  getDashboardStats,
} = require('../controllers/adminController');
const {
  listSchools,
  createSchool,
  updateSchool,
  updateSchoolStatus,
  deleteSchool,
  getSchoolAnalytics,
  listUsers,
  updateUser,
  resetUserPassword,
} = require('../controllers/adminManagementController');
const {
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncementStatus,
} = require('../controllers/announcementController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Validation rules
const schoolCodeValidation = [
  body('schoolName').trim().notEmpty().withMessage('School name is required'),
];

const announcementValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('audience').optional().isIn(['all', 'teachers', 'students']).withMessage('Invalid audience'),
];

// Routes
router.post(
  '/generate-school-code',
  authenticate,
  roleCheck('admin'),
  schoolCodeValidation,
  generateSchoolCode
);

router.get(
  '/schools',
  authenticate,
  roleCheck('admin'),
  getAllSchools
);

router.get(
  '/stats',
  authenticate,
  roleCheck('admin'),
  getDashboardStats
);

router.get(
  '/management/schools',
  authenticate,
  roleCheck('admin'),
  listSchools
);

router.post(
  '/management/schools',
  authenticate,
  roleCheck('admin'),
  createSchool
);

router.patch(
  '/management/schools/:schoolId',
  authenticate,
  roleCheck('admin'),
  updateSchool
);

router.post(
  '/management/schools/:schoolId/status',
  authenticate,
  roleCheck('admin'),
  updateSchoolStatus
);

router.delete(
  '/management/schools/:schoolId',
  authenticate,
  roleCheck('admin'),
  deleteSchool
);

router.get(
  '/management/schools/:schoolId/analytics',
  authenticate,
  roleCheck('admin'),
  getSchoolAnalytics
);

router.get(
  '/users',
  authenticate,
  roleCheck('admin'),
  listUsers
);

router.patch(
  '/users/:userId',
  authenticate,
  roleCheck('admin'),
  updateUser
);

router.post(
  '/users/:userId/reset-password',
  authenticate,
  roleCheck('admin'),
  resetUserPassword
);

// Announcement routes
router.post(
  '/announcements',
  authenticate,
  roleCheck('admin'),
  announcementValidation,
  createAnnouncement
);

router.get(
  '/announcements',
  authenticate,
  roleCheck('admin'),
  getAllAnnouncements
);

router.patch(
  '/announcements/:id/status',
  authenticate,
  roleCheck('admin'),
  updateAnnouncementStatus
);

module.exports = router;

