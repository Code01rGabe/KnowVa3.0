const School = require('../models/School');
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const { validationResult } = require('express-validator');

// Generate school code
const generateSchoolCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolName } = req.body;

    // Generate unique school code
    let schoolCode;
    let isUnique = false;
    
    while (!isUnique) {
      schoolCode = School.generateCode('SCH');
      const existing = await School.findOne({ schoolCode });
      if (!existing) {
        isUnique = true;
      }
    }

    // Create school entry (without rep yet)
    const school = await School.create({
      name: schoolName,
      schoolCode,
      schoolRepId: null, // Will be set when school rep registers
    });

    res.status(201).json({
      message: 'School code generated successfully',
      school: {
        id: school._id,
        name: school.name,
        schoolCode: school.schoolCode,
      },
    });
  } catch (error) {
    console.error('Generate school code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all schools
const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find()
      .populate('schoolRepId', 'email profile.name')
      .select('-__v');

    res.json({
      schools,
    });
  } catch (error) {
    console.error('Get all schools error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalSchools,
      activeSchools,
      totalUsers,
      adminCount,
      repCount,
      teacherCount,
      studentCount,
      totalCourses,
      totalAssignments,
      pendingSubmissions,
    ] = await Promise.all([
      School.countDocuments(),
      School.countDocuments({ schoolRepId: { $ne: null } }),
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'schoolRep' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Assignment.countDocuments(),
      Submission.countDocuments({ status: 'pending' }),
    ]);

    const studentAggregate = await Course.aggregate([
      { $project: { studentCount: { $size: '$enrolledStudents' } } },
      { $group: { _id: null, total: { $sum: '$studentCount' } } },
    ]);

    const totalEnrolled = studentAggregate[0]?.total || 0;
    const avgStudentsPerCourse = totalCourses
      ? Number((totalEnrolled / totalCourses).toFixed(1))
      : 0;

    const latestSchools = await School.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name schoolCode createdAt');

    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email role profile.name createdAt');

    res.json({
      stats: {
        totalSchools,
        activeSchools,
        totalUsers,
        admins: adminCount,
        schoolReps: repCount,
        teachers: teacherCount,
        students: studentCount,
        totalCourses,
        totalAssignments,
        pendingSubmissions,
        avgStudentsPerCourse,
      },
      recent: {
        schools: latestSchools,
        users: latestUsers,
      },
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { generateSchoolCode, getAllSchools, getDashboardStats };

