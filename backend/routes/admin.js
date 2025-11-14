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
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Validation rules
const schoolCodeValidation = [
  body('schoolName').trim().notEmpty().withMessage('School name is required'),
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

module.exports = router;

