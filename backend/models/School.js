const mongoose = require('mongoose');
const crypto = require('crypto');

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    schoolCode: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    schoolRepId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    teacherCode: {
      type: String,
      unique: true,
      default: null,
      uppercase: true,
      trim: true,
    },
    studentCode: {
      type: String,
      unique: true,
      default: null,
      uppercase: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  branding: {
    logoUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#ff6600' },
    secondaryColor: { type: String, default: '#2d1b3d' },
    motto: { type: String, default: '' },
  },
  gradingSystem: {
    type: String,
    default: 'percentage',
  },
  timetable: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  subscription: {
    plan: { type: String, default: 'free' },
    status: { type: String, enum: ['active', 'past_due', 'canceled'], default: 'active' },
    renewalDate: { type: Date, default: null },
  },
  },
  {
    timestamps: true,
  }
);

// Generate unique code
schoolSchema.statics.generateCode = function (prefix = 'SCH') {
  return `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

module.exports = mongoose.model('School', schoolSchema);

