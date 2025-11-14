const bcrypt = require('bcryptjs');
const School = require('../models/School');
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

const buildPagination = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// ----------- School Management -----------

const listSchools = async (req, res) => {
  try {
    const { search = '', status } = req.query;
    const { page, limit, skip } = buildPagination(req);

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (status) {
      filter.status = status;
    }

    const [schools, total] = await Promise.all([
      School.find(filter)
        .populate('schoolRepId', 'email profile.name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      School.countDocuments(filter),
    ]);

    res.json({
      data: schools,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin list schools error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createSchool = async (req, res) => {
  try {
    const { name, description, address, contactEmail, contactPhone } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'School name is required' });
    }

    let schoolCode;
    let isUnique = false;

    while (!isUnique) {
      schoolCode = School.generateCode('SCH');
      const exists = await School.findOne({ schoolCode });
      if (!exists) {
        isUnique = true;
      }
    }

    const school = await School.create({
      name,
      description,
      address,
      contactEmail,
      contactPhone,
      schoolCode,
    });

    res.status(201).json({ message: 'School created', school });
  } catch (error) {
    console.error('Admin create school error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const updates = (({ name, description, address, contactEmail, contactPhone }) => ({
      name,
      description,
      address,
      contactEmail,
      contactPhone,
    }))(req.body);

    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    const school = await School.findByIdAndUpdate(schoolId, updates, {
      new: true,
      runValidators: true,
    });

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    res.json({ message: 'School updated', school });
  } catch (error) {
    console.error('Admin update school error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSchoolStatus = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const school = await School.findByIdAndUpdate(
      schoolId,
      { status },
      { new: true }
    );

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    res.json({ message: `School ${status}`, school });
  } catch (error) {
    console.error('Admin update school status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    await School.findByIdAndDelete(schoolId);
    await User.updateMany({ schoolId }, { $set: { schoolId: null } });

    res.json({ message: 'School deleted' });
  } catch (error) {
    console.error('Admin delete school error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSchoolAnalytics = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const [teacherCount, studentCount, courses] = await Promise.all([
      User.countDocuments({ schoolId, role: 'teacher' }),
      User.countDocuments({ schoolId, role: 'student' }),
      Course.find({ schoolId }).select('_id title enrolledStudents createdAt'),
    ]);

    const courseIds = courses.map((course) => course._id);

    const [assignmentCount, pendingSubmissions] = await Promise.all([
      courseIds.length
        ? Assignment.countDocuments({ courseId: { $in: courseIds } })
        : 0,
      courseIds.length
        ? Submission.countDocuments({ courseId: { $in: courseIds }, status: 'pending' })
        : 0,
    ]);

    res.json({
      school,
      stats: {
        teachers: teacherCount,
        students: studentCount,
        courses: courses.length,
        assignments: assignmentCount,
        pendingSubmissions,
        totalEnrollments: courses.reduce(
          (sum, course) => sum + (course.enrolledStudents?.length || 0),
          0
        ),
      },
    });
  } catch (error) {
    console.error('Admin school analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ----------- User Management -----------

const listUsers = async (req, res) => {
  try {
    const { search = '', role, status, schoolId } = req.query;
    const { page, limit, skip } = buildPagination(req);

    const filter = {};

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.isActive = status === 'active';
    }

    if (schoolId) {
      filter.schoolId = schoolId;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('schoolId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive, schoolId } = req.body;

    const updates = {};

    if (role) {
      updates.role = role;
    }

    if (typeof isActive === 'boolean') {
      updates.isActive = isActive;
    }

    if (schoolId !== undefined) {
      updates.schoolId = schoolId || null;
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).populate('schoolId', 'name');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated', user });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Admin reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  listSchools,
  createSchool,
  updateSchool,
  updateSchoolStatus,
  deleteSchool,
  getSchoolAnalytics,
  listUsers,
  updateUser,
  resetUserPassword,
};

