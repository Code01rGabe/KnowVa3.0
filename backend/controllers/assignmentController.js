const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { validationResult } = require('express-validator');

// Create assignment
const createAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, courseId, dueDate, maxPoints, attachments } = req.body;

    // Verify course exists and teacher owns it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the course teacher can create assignments' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      courseId,
      teacherId: req.user.userId,
      dueDate,
      maxPoints,
      attachments: attachments || [],
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('courseId', 'title')
      .populate('teacherId', 'email profile.name');

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment: populatedAssignment,
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get assignments
const getAssignments = async (req, res) => {
  try {
    let assignments;

    if (req.user.role === 'teacher') {
      // Teachers see assignments for their courses
      assignments = await Assignment.find({ teacherId: req.user.userId })
        .populate('courseId', 'title')
        .populate('teacherId', 'email profile.name')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'student') {
      // Students see assignments for courses they're enrolled in
      const courses = await Course.find({ enrolledStudents: req.user.userId });
      const courseIds = courses.map(c => c._id);
      
      assignments = await Assignment.find({ courseId: { $in: courseIds } })
        .populate('courseId', 'title')
        .populate('teacherId', 'email profile.name')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get assignments by course
const getAssignmentsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Verify course access
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role === 'teacher' && course.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'student' && !course.enrolledStudents.some(s => s.toString() === req.user.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const assignments = await Assignment.find({ courseId })
      .populate('courseId', 'title')
      .populate('teacherId', 'email profile.name')
      .sort({ createdAt: -1 });

    res.json({ assignments });
  } catch (error) {
    console.error('Get assignments by course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single assignment
const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('courseId', 'title description')
      .populate('teacherId', 'email profile.name');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify access
    const course = await Course.findById(assignment.courseId._id);
    
    if (req.user.role === 'teacher' && course.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'student' && !course.enrolledStudents.some(s => s.toString() === req.user.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ assignment });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update assignment
const updateAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Only teacher who created the assignment can update
    if (assignment.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the assignment teacher can update this assignment' });
    }

    const { title, description, dueDate, maxPoints, attachments } = req.body;

    if (title) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate) assignment.dueDate = dueDate;
    if (maxPoints !== undefined) assignment.maxPoints = maxPoints;
    if (attachments !== undefined) assignment.attachments = attachments;

    await assignment.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('courseId', 'title')
      .populate('teacherId', 'email profile.name');

    res.json({
      message: 'Assignment updated successfully',
      assignment: populatedAssignment,
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete assignment
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Only teacher who created the assignment can delete
    if (assignment.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the assignment teacher can delete this assignment' });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentsByCourse,
  getAssignment,
  updateAssignment,
  deleteAssignment,
};

