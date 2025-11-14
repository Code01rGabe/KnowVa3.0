const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  removeStudent,
} = require('../controllers/courseController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Validation rules
const courseValidation = [
  body('title').trim().notEmpty().withMessage('Course title is required'),
];

// Routes
router.post(
  '/',
  authenticate,
  roleCheck('teacher'),
  courseValidation,
  createCourse
);

router.get(
  '/',
  authenticate,
  roleCheck('teacher', 'student', 'schoolRep'),
  getCourses
);

router.get(
  '/:id',
  authenticate,
  roleCheck('teacher', 'student', 'schoolRep'),
  getCourse
);

router.put(
  '/:id',
  authenticate,
  roleCheck('teacher'),
  courseValidation,
  updateCourse
);

router.delete(
  '/:id',
  authenticate,
  roleCheck('teacher'),
  deleteCourse
);

router.post(
  '/:id/enroll',
  authenticate,
  roleCheck('teacher'),
  body('studentId').notEmpty().withMessage('Student ID is required'),
  enrollStudent
);

router.post(
  '/:id/remove-student',
  authenticate,
  roleCheck('teacher'),
  body('studentId').notEmpty().withMessage('Student ID is required'),
  removeStudent
);

module.exports = router;

