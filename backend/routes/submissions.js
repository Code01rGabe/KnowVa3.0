const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  submitAssignment,
  getSubmissions,
  getMySubmission,
  gradeSubmission,
  getStudentSubmissions,
} = require('../controllers/submissionController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Validation rules
const submissionValidation = [
  body('assignmentId').notEmpty().withMessage('Assignment ID is required'),
];

const gradeValidation = [
  body('grade').isNumeric().withMessage('Grade must be a number'),
  body('grade').custom((value) => {
    if (value < 0) {
      throw new Error('Grade cannot be negative');
    }
    return true;
  }),
];

// Routes
router.post(
  '/',
  authenticate,
  roleCheck('student'),
  submissionValidation,
  submitAssignment
);

router.get(
  '/',
  authenticate,
  roleCheck('teacher'),
  getSubmissions
);

router.get(
  '/my-submissions',
  authenticate,
  roleCheck('student'),
  getStudentSubmissions
);

router.get(
  '/assignment/:assignmentId',
  authenticate,
  roleCheck('student'),
  getMySubmission
);

router.get(
  '/:id',
  authenticate,
  roleCheck('teacher'),
  async (req, res) => {
    try {
      const Submission = require('../models/Submission');
      const submission = await Submission.findById(req.params.id)
        .populate('assignmentId', 'title maxPoints dueDate')
        .populate('studentId', 'email profile.name')
        .populate('courseId', 'title');
      
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }
      
      res.json({ submission });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

router.put(
  '/:id/grade',
  authenticate,
  roleCheck('teacher'),
  gradeValidation,
  gradeSubmission
);

module.exports = router;

