import express from 'express';
import {
  getAllNotification,
  getUnreadCount,
  getUnreadNotification,
  markNotificationAsRead,
} from '../controllers/Notification.controllers.js';

const router = express.Router();

router.get('/:userId', getAllNotification);

router.get('/unread/:userId', getUnreadNotification);

router.get('/unread-count/:userId', getUnreadCount);

router.put('/', markNotificationAsRead);

export default router;
