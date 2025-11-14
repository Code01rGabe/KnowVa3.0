const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'schoolRep', 'teacher', 'student'],
    required: [true, 'Role is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    default: null,
  },
  profile: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be longer than 100 characters'],
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
      maxlength: [500, 'Bio cannot be longer than 500 characters'],
    },
  },
}, {
  timestamps: true,
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ schoolId: 1 });

// Hash password before saving - SIMPLIFIED and RELIABLE version
userSchema.pre('save', async function (next) {
  // Only run this if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }

  // SIMPLE check if password is already hashed
  if (this.password.startsWith('$2a$') || 
      this.password.startsWith('$2b$') || 
      this.password.startsWith('$2y$')) {
    return next();
  }

  // Only hash if it's a plain text password
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Method to check if user has specific role
userSchema.methods.hasRole = function (role) {
  return this.role === role;
};

// Method to check if user has any of the specified roles
userSchema.methods.hasAnyRole = function (roles) {
  return roles.includes(this.role);
};

// Static method to find active users
userSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Static method to find users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true });
};

// Virtual for user's full display name
userSchema.virtual('displayName').get(function () {
  return this.profile.name;
});

// Virtual for checking if user is admin
userSchema.virtual('isAdmin').get(function () {
  return this.role === 'admin';
});

// Virtual for checking if user is school representative
userSchema.virtual('isSchoolRep').get(function () {
  return this.role === 'schoolRep';
});

// Virtual for checking if user is teacher
userSchema.virtual('isTeacher').get(function () {
  return this.role === 'teacher';
});

// Virtual for checking if user is student
userSchema.virtual('isStudent').get(function () {
  return this.role === 'student';
});

// Transform output to remove password
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

userSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

// Middleware to update lastLoginAt
userSchema.methods.updateLastLogin = async function () {
  this.lastLoginAt = new Date();
  await this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema);