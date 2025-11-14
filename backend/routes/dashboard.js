const express = require('express');
const router = express.Router();
const { getTeacherStats, getStudentStats } = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get(
  '/teacher',
  authenticate,
  roleCheck('teacher'),
  getTeacherStats
);

router.get(
  '/student',
  authenticate,
  roleCheck('student'),
  getStudentStats
);

module.exports = router;

