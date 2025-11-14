const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
  },
  audience: {
    type: String,
    enum: ['all', 'teachers', 'students'],
    default: 'all',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
announcementSchema.index({ isActive: 1, audience: 1, expiresAt: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);

