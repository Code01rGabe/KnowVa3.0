const Announcement = require('../models/Announcement');
const { validationResult } = require('express-validator');

// Create a new announcement
const createAnnouncement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, message, audience } = req.body;
    const userId = req.user.userId;

    const announcement = await Announcement.create({
      title,
      message,
      audience: audience || 'all',
      createdBy: userId,
    });

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: {
        id: announcement._id,
        title: announcement.title,
        message: announcement.message,
        audience: announcement.audience,
        createdAt: announcement.createdAt,
      },
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get active announcements for the current user
const getActiveAnnouncements = async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // Determine which announcements the user should see
    let audienceFilter = ['all'];
    if (userRole === 'teacher') {
      audienceFilter = ['all', 'teachers'];
    } else if (userRole === 'student') {
      audienceFilter = ['all', 'students'];
    } else if (userRole === 'schoolRep') {
      audienceFilter = ['all'];
    } else if (userRole === 'admin') {
      audienceFilter = ['all'];
    }

    const now = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      audience: { $in: audienceFilter },
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
    })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'profile.name email')
      .select('title message audience createdAt createdBy')
      .limit(10);

    res.json({
      announcements,
    });
  } catch (error) {
    console.error('Get active announcements error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all announcements (admin only)
const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'profile.name email')
      .select('-__v');

    res.json({
      announcements,
    });
  } catch (error) {
    console.error('Get all announcements error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update announcement status (admin only)
const updateAnnouncementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({
      message: 'Announcement status updated',
      announcement,
    });
  } catch (error) {
    console.error('Update announcement status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createAnnouncement,
  getActiveAnnouncements,
  getAllAnnouncements,
  updateAnnouncementStatus,
};

