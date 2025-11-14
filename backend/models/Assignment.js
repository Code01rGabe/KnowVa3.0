const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  maxPoints: {
    type: Number,
    required: [true, 'Maximum points is required'],
    min: 0,
  },
  attachments: [{
    type: String,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Assignment', assignmentSchema);

