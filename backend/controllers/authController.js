const User = require('../models/User');
const School = require('../models/School');
const { generateToken } = require('../config/jwt');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Register user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role, schoolCode, teacherCode, studentCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    let schoolId = null;

    // Handle different role signups
    if (role === 'admin') {
      // Disable admin registration - use pre-created account only
      return res.status(403).json({ 
        message: 'Admin registration is disabled. Use the predefined admin account.' 
      });
    } else if (role === 'schoolRep') {
      // School rep needs school code
      if (!schoolCode) {
        return res.status(400).json({ message: 'School code is required for school rep registration' });
      }

      // Trim and normalize the school code to uppercase
      const normalizedCode = schoolCode.trim().toUpperCase();
      
      // Find school by code (exact match - codes are stored in uppercase)
      const school = await School.findOne({ schoolCode: normalizedCode });
      
      if (!school) {
        // Debug: log available codes for troubleshooting
        const allSchools = await School.find({}, 'schoolCode name');
        console.error(`School code not found: "${normalizedCode}"`);
        console.error('Available school codes:', allSchools.map(s => s.schoolCode).join(', '));
        return res.status(404).json({ message: 'Invalid school code. Please check the code and try again.' });
      }

      if (school.schoolRepId) {
        return res.status(400).json({ message: 'School already has a representative' });
      }

      // Create school rep user
      const user = await User.create({
        email,
        password,
        role,
        schoolId: school._id,
        profile: { name },
      });

      // Update school with rep ID and generate codes
      school.schoolRepId = user._id;
      school.teacherCode = School.generateCode('TCH');
      school.studentCode = School.generateCode('STU');
      
      // Save school and verify it was saved
      await school.save();
      
      // Verify the school was updated correctly
      const updatedSchool = await School.findById(school._id);
      if (!updatedSchool || updatedSchool.schoolRepId.toString() !== user._id.toString()) {
        console.error('Warning: School was not properly updated with schoolRepId');
        // Try to fix it
        updatedSchool.schoolRepId = user._id;
        await updatedSchool.save();
      }

      const token = generateToken(user._id, user.role);

      return res.status(201).json({
        message: 'School rep registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          schoolId: school._id,
          isActive: user.isActive,
        },
        school: {
          id: school._id,
          name: school.name,
          teacherCode: school.teacherCode,
          studentCode: school.studentCode,
        },
      });
    } else if (role === 'teacher') {
      // Teacher needs teacher code
      if (!teacherCode) {
        return res.status(400).json({ message: 'Teacher code is required' });
      }

      // Trim and normalize the teacher code to uppercase
      const normalizedCode = teacherCode.trim().toUpperCase();
      
      // Find school by teacher code (exact match - codes are stored in uppercase)
      const school = await School.findOne({ teacherCode: normalizedCode });
      
      if (!school) {
        return res.status(404).json({ message: 'Invalid teacher code. Please check the code and try again.' });
      }

      const user = await User.create({
        email,
        password,
        role,
        schoolId: school._id,
        profile: { name },
      });

      const token = generateToken(user._id, user.role);

      return res.status(201).json({
        message: 'Teacher registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          schoolId: school._id,
          isActive: user.isActive,
        },
      });
    } else if (role === 'student') {
      // Student needs student code
      if (!studentCode) {
        return res.status(400).json({ message: 'Student code is required' });
      }

      // Trim and normalize the student code to uppercase
      const normalizedCode = studentCode.trim().toUpperCase();
      
      // Find school by student code (exact match - codes are stored in uppercase)
      const school = await School.findOne({ studentCode: normalizedCode });
      
      if (!school) {
        return res.status(404).json({ message: 'Invalid student code. Please check the code and try again.' });
      }

      const user = await User.create({
        email,
        password,
        role,
        schoolId: school._id,
        profile: { name },
      });

      const token = generateToken(user._id, user.role);

      return res.status(201).json({
        message: 'Student registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          schoolId: school._id,
          isActive: user.isActive,
        },
      });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
    }

    // Check password using bcrypt directly to ensure consistency
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('🔐 Password comparison failed');
      console.log('📧 Email:', email);
      console.log('🔑 Provided password:', password);
      console.log('💾 Stored hash:', user.password);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        schoolId: user.schoolId,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        schoolId: user.schoolId,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, getMe };