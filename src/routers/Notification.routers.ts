import express from 'express';
import {
  getAllNotification,
  getUnreadCount,
  getUnreadNotification,
  markAllNotificationAsRead,
  markNotificationAsRead,
} from '../controllers/Notification.controllers.js';

const router = express.Router();

router.get('/:userId', getAllNotification);

router.get('/unread/:userId', getUnreadNotification);

router.get('/unread-count/:userId', getUnreadCount);

router.put('/mark', markNotificationAsRead);

router.put('/mark-all', markAllNotificationAsRead);

export default router;
