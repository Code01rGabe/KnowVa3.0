const express = require('express');
const router = express.Router();
const { getActiveAnnouncements } = require('../controllers/announcementController');
const authenticate = require('../middleware/auth');

// Get active announcements for the current user
router.get(
  '/',
  authenticate,
  getActiveAnnouncements
);

module.exports = router;

