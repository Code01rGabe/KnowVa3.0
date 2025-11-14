const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { validationResult } = require('express-validator');

// Submit assignment
const submitAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assignmentId, content, attachments } = req.body;

    // Verify assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify student is enrolled in the course
    const course = await Course.findById(assignment.courseId);
    if (!course.enrolledStudents.some(s => s.toString() === req.user.userId)) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Check if submission already exists
    let submission = await Submission.findOne({
      assignmentId,
      studentId: req.user.userId,
    });

    if (submission) {
      // Update existing submission
      submission.content = content || submission.content;
      submission.attachments = attachments || submission.attachments;
      submission.submittedAt = new Date();
      submission.status = 'pending';
      await submission.save();
    } else {
      // Create new submission
      submission = await Submission.create({
        assignmentId,
        studentId: req.user.userId,
        courseId: assignment.courseId,
        content: content || '',
        attachments: attachments || [],
        status: 'pending',
      });
    }

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('assignmentId', 'title maxPoints')
      .populate('studentId', 'email profile.name')
      .populate('courseId', 'title');

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission: populatedSubmission,
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get submissions (for teachers)
const getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.query;

    if (!assignmentId) {
      return res.status(400).json({ message: 'Assignment ID is required' });
    }

    // Verify assignment exists and teacher owns it
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the assignment teacher can view submissions' });
    }

    const submissions = await Submission.find({ assignmentId })
      .populate('assignmentId', 'title maxPoints dueDate')
      .populate('studentId', 'email profile.name')
      .populate('courseId', 'title')
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student's submission
const getMySubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submission = await Submission.findOne({
      assignmentId,
      studentId: req.user.userId,
    })
      .populate('assignmentId', 'title maxPoints dueDate')
      .populate('studentId', 'email profile.name')
      .populate('courseId', 'title');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Get my submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Grade submission
const gradeSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { grade, feedback } = req.body;

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Verify assignment exists and teacher owns it
    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the assignment teacher can grade submissions' });
    }

    // Validate grade
    if (grade < 0 || grade > assignment.maxPoints) {
      return res.status(400).json({ message: `Grade must be between 0 and ${assignment.maxPoints}` });
    }

    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.status = 'graded';
    await submission.save();

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('assignmentId', 'title maxPoints')
      .populate('studentId', 'email profile.name')
      .populate('courseId', 'title');

    res.json({
      message: 'Submission graded successfully',
      submission: populatedSubmission,
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all submissions for a student
const getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user.userId })
      .populate('assignmentId', 'title maxPoints dueDate')
      .populate('courseId', 'title')
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (error) {
    console.error('Get student submissions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  submitAssignment,
  getSubmissions,
  getMySubmission,
  gradeSubmission,
  getStudentSubmissions,
};

