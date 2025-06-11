import { Request, Response } from 'express';
import { handleError } from '../utils/utils.js';
import { NotificationModel } from '../models/Notification.models.js';

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { userId, notificationId } = req.query;
    const result = await NotificationModel.updateOne(
      {
        _id: notificationId,
        recipients: { $in: [userId] },
        'readBy.userId': { $ne: userId }, // only update if the user has not read this notification
      },
      {
        $push: {
          readBy: {
            userId,
            readAt: new Date(),
          },
        },
      }
    );

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const notifications = await NotificationModel.find({
      recipients: { $in: [userId] },
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    handleError(err, res);
  }
};

export const getUnreadNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const result = await NotificationModel.find({
      recipients: { $in: [userId] },
      'readBy.userId': { $ne: userId },
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const count = await NotificationModel.countDocuments({
      recipients: { $in: [userId] },
      'readBy.userId': { $ne: userId },
      isActive: true,
    });

    res.status(200).json({ count });
  } catch (err) {
    handleError(err, res);
  }
};
