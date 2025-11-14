import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Notification.css';

const Notification = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => {
    // Load dismissed announcements from localStorage
    const saved = localStorage.getItem('dismissedAnnouncements');
    return saved ? JSON.parse(saved) : [];
  });

  const loadAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      const saved = localStorage.getItem('dismissedAnnouncements');
      const dismissed = saved ? JSON.parse(saved) : [];
      const activeAnnouncements = response.data.announcements.filter(
        (announcement) => !dismissed.includes(announcement._id)
      );
      setAnnouncements(activeAnnouncements);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadAnnouncements();
      // Poll for new announcements every 30 seconds
      const interval = setInterval(loadAnnouncements, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleDismiss = (id) => {
    setDismissedIds((prev) => {
      const updated = [...prev, id];
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(updated));
      return updated;
    });
    setAnnouncements((prev) => prev.filter((ann) => ann._id !== id));
  };

  if (!user || announcements.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {announcements.map((announcement) => (
        <div key={announcement._id} className="notification-card">
          <div className="notification-header">
            <div className="notification-icon">📢</div>
            <h3 className="notification-title">{announcement.title}</h3>
            <button
              className="notification-close"
              onClick={() => handleDismiss(announcement._id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
          <p className="notification-message">{announcement.message}</p>
          {announcement.createdBy && (
            <p className="notification-meta">
              From: {announcement.createdBy.profile?.name || announcement.createdBy.email}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Notification;

