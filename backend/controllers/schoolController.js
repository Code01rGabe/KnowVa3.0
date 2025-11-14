const School = require('../models/School');
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const { validationResult } = require('express-validator');

// Get school details
const getSchool = async (req, res) => {
  try {
    console.log(`Getting school for user ${req.user.userId}, role: ${req.user.role}, schoolId: ${req.user.schoolId}`);
    
    // Find school by schoolRepId (most reliable for school reps)
    let school = await School.findOne({ schoolRepId: req.user.userId })
      .populate('schoolRepId', 'email profile.name');

    // Fallback: if not found by schoolRepId, try by schoolId
    if (!school && req.user.schoolId) {
      console.log(`Trying to find school by schoolId: ${req.user.schoolId}`);
      school = await School.findById(req.user.schoolId)
        .populate('schoolRepId', 'email profile.name');
    }

    // Debug: List all schools if still not found
    if (!school) {
      const allSchools = await School.find({}, 'name schoolCode schoolRepId');
      console.error(`School not found for user ${req.user.userId}`);
      console.error('All schools in database:', JSON.stringify(allSchools, null, 2));
      return res.status(404).json({ 
        message: 'School not found. Please contact support.',
        debug: {
          userId: req.user.userId,
          schoolId: req.user.schoolId,
          totalSchools: allSchools.length
        }
      });
    }

    res.json({
      school: {
        id: school._id,
        name: school.name,
        schoolCode: school.schoolCode,
        teacherCode: school.teacherCode,
        studentCode: school.studentCode,
        schoolRep: school.schoolRepId,
      },
    });
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Regenerate teacher code
const regenerateTeacherCode = async (req, res) => {
  try {
    // Find school by schoolRepId
    let school = await School.findOne({ schoolRepId: req.user.userId });
    
    // Fallback: if not found by schoolRepId, try by schoolId
    if (!school && req.user.schoolId) {
      school = await School.findById(req.user.schoolId);
    }
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    if (school.schoolRepId && school.schoolRepId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only school rep can regenerate codes' });
    }

    let teacherCode;
    let isUnique = false;
    
    while (!isUnique) {
      teacherCode = School.generateCode('TCH');
      const existing = await School.findOne({ teacherCode });
      if (!existing || existing._id.toString() === school._id.toString()) {
        isUnique = true;
      }
    }

    school.teacherCode = teacherCode;
    await school.save();

    res.json({
      message: 'Teacher code regenerated successfully',
      teacherCode: school.teacherCode,
    });
  } catch (error) {
    console.error('Regenerate teacher code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Regenerate student code
const regenerateStudentCode = async (req, res) => {
  try {
    // Find school by schoolRepId
    let school = await School.findOne({ schoolRepId: req.user.userId });
    
    // Fallback: if not found by schoolRepId, try by schoolId
    if (!school && req.user.schoolId) {
      school = await School.findById(req.user.schoolId);
    }
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    if (school.schoolRepId && school.schoolRepId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only school rep can regenerate codes' });
    }

    let studentCode;
    let isUnique = false;
    
    while (!isUnique) {
      studentCode = School.generateCode('STU');
      const existing = await School.findOne({ studentCode });
      if (!existing || existing._id.toString() === school._id.toString()) {
        isUnique = true;
      }
    }

    school.studentCode = studentCode;
    await school.save();

    res.json({
      message: 'Student code regenerated successfully',
      studentCode: school.studentCode,
    });
  } catch (error) {
    console.error('Regenerate student code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get school statistics
const getSchoolStats = async (req, res) => {
  try {
    // Find school by schoolRepId
    let school = await School.findOne({ schoolRepId: req.user.userId });
    
    // Fallback: if not found by schoolRepId, try by schoolId
    if (!school && req.user.schoolId) {
      school = await School.findById(req.user.schoolId);
    }
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const [teacherCount, studentCount] = await Promise.all([
      User.countDocuments({ schoolId: school._id, role: 'teacher' }),
      User.countDocuments({ schoolId: school._id, role: 'student' }),
    ]);

    const courses = await Course.find({ schoolId: school._id }).select('_id');
    const courseIds = courses.map((course) => course._id);
    const courseCount = courses.length;

    const assignmentCount = courseIds.length
      ? await Assignment.countDocuments({ courseId: { $in: courseIds } })
      : 0;

    const pendingSubmissions = courseIds.length
      ? await Submission.countDocuments({ courseId: { $in: courseIds }, status: 'pending' })
      : 0;

    res.json({
      stats: {
        teachers: teacherCount,
        students: studentCount,
        courses: courseCount,
        assignments: assignmentCount,
        pendingSubmissions,
      },
    });
  } catch (error) {
    console.error('Get school stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get list of students within the same school
const getSchoolStudents = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    if (!schoolId) {
      return res.status(400).json({ message: 'No school associated with this account' });
    }

    const students = await User.find({
      schoolId,
      role: 'student',
      isActive: true,
    })
      .select('_id email profile.name createdAt')
      .sort({ 'profile.name': 1, email: 1 });

    res.json({ students });
  } catch (error) {
    console.error('Get school students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSchoolTeachers = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    if (!schoolId) {
      return res.status(400).json({ message: 'No school associated with this account' });
    }

    const teachers = await User.find({
      schoolId,
      role: 'teacher',
      isActive: true,
    })
      .select('_id email profile.name createdAt')
      .sort({ 'profile.name': 1, email: 1 });

    res.json({ teachers });
  } catch (error) {
    console.error('Get school teachers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSchool,
  regenerateTeacherCode,
  regenerateStudentCode,
  getSchoolStats,
  getSchoolStudents,
  getSchoolTeachers,
};

