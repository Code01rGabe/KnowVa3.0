const Course = require('../models/Course');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Create course
const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;

    // Only teachers can create courses
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create courses' });
    }

    const course = await Course.create({
      title,
      description,
      schoolId: req.user.schoolId,
      teacherId: req.user.userId,
      enrolledStudents: [],
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('teacherId', 'email profile.name')
      .populate('enrolledStudents', 'email profile.name');

    res.status(201).json({
      message: 'Course created successfully',
      course: populatedCourse,
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all courses
const getCourses = async (req, res) => {
  try {
    let courses;

    if (req.user.role === 'teacher') {
      // Teachers see their own courses
      courses = await Course.find({ teacherId: req.user.userId })
        .populate('teacherId', 'email profile.name')
        .populate('enrolledStudents', 'email profile.name')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'student') {
      // Students see courses they're enrolled in
      courses = await Course.find({ enrolledStudents: req.user.userId })
        .populate('teacherId', 'email profile.name')
        .populate('enrolledStudents', 'email profile.name')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'schoolRep') {
      // School reps see all courses in their school
      courses = await Course.find({ schoolId: req.user.schoolId })
        .populate('teacherId', 'email profile.name')
        .populate('enrolledStudents', 'email profile.name')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single course
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacherId', 'email profile.name')
      .populate('enrolledStudents', 'email profile.name');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check access
    if (req.user.role === 'teacher' && course.teacherId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'student' && !course.enrolledStudents.some(s => s._id.toString() === req.user.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'schoolRep' && course.schoolId.toString() !== req.user.schoolId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Only teacher who created the course can update
    if (course.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the course teacher can update this course' });
    }

    const { title, description } = req.body;

    if (title) course.title = title;
    if (description !== undefined) course.description = description;

    await course.save();

    const populatedCourse = await Course.findById(course._id)
      .populate('teacherId', 'email profile.name')
      .populate('enrolledStudents', 'email profile.name');

    res.json({
      message: 'Course updated successfully',
      course: populatedCourse,
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Only teacher who created the course can delete
    if (course.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the course teacher can delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Enroll student in course
const enrollStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Only teachers can enroll students
    if (req.user.role !== 'teacher' || course.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the course teacher can enroll students' });
    }

    const { studentId } = req.body;

    // Check if student exists and is in the same school
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student' || student.schoolId.toString() !== course.schoolId.toString()) {
      return res.status(400).json({ message: 'Invalid student or student not in same school' });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }

    course.enrolledStudents.push(studentId);
    await course.save();

    const populatedCourse = await Course.findById(course._id)
      .populate('teacherId', 'email profile.name')
      .populate('enrolledStudents', 'email profile.name');

    res.json({
      message: 'Student enrolled successfully',
      course: populatedCourse,
    });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove student from course
const removeStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Only teachers can remove students
    if (req.user.role !== 'teacher' || course.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the course teacher can remove students' });
    }

    const { studentId } = req.body;

    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== studentId
    );
    await course.save();

    const populatedCourse = await Course.findById(course._id)
      .populate('teacherId', 'email profile.name')
      .populate('enrolledStudents', 'email profile.name');

    res.json({
      message: 'Student removed successfully',
      course: populatedCourse,
    });
  } catch (error) {
    console.error('Remove student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  removeStudent,
};

