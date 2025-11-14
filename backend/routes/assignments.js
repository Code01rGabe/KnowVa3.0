const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createAssignment,
  getAssignments,
  getAssignmentsByCourse,
  getAssignment,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Validation rules
const assignmentValidation = [
  body('title').trim().notEmpty().withMessage('Assignment title is required'),
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('maxPoints').isNumeric().withMessage('Maximum points must be a number'),
];

// Routes
router.post(
  '/',
  authenticate,
  roleCheck('teacher'),
  assignmentValidation,
  createAssignment
);

router.get(
  '/',
  authenticate,
  roleCheck('teacher', 'student'),
  getAssignments
);

router.get(
  '/course/:courseId',
  authenticate,
  roleCheck('teacher', 'student'),
  getAssignmentsByCourse
);

router.get(
  '/:id',
  authenticate,
  roleCheck('teacher', 'student'),
  getAssignment
);

router.put(
  '/:id',
  authenticate,
  roleCheck('teacher'),
  assignmentValidation,
  updateAssignment
);

router.delete(
  '/:id',
  authenticate,
  roleCheck('teacher'),
  deleteAssignment
);

module.exports = router;

