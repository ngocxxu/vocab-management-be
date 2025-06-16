import { socketIO } from '../main';
import { NotificationModel } from '../models/Notification.models';
import { EActionSocket, EEmitSocket, ETypeSocket } from '../types/Global.types';

export const sendNotification = async (
  type: ETypeSocket,
  action: EActionSocket,
  emit: EEmitSocket,
  data: any
) => {
  try {
    // Get all sockets in the 'all-users' room
    const socketsInRoom = await socketIO.in('all-users').fetchSockets();

    // Get userIds from the sockets
    const userIds = socketsInRoom
      .map((socket) => (socket as any).user.userId)
      .filter((userId) => userId); // remove any undefined values

    if (userIds.length > 0) {
      const notification = new NotificationModel({
        type,
        action,
        data,
        recipients: userIds,
        readBy: [],
        metadata: {
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30days from now
        },
      });

      await notification.save();

      // Emit the notification to all users in the 'all-users' room
      socketIO.to('all-users').emit(emit, {
        id: notification._id,
        type,
        action,
        timestamp: new Date(),
        data,
      });
    }
  } catch (error) {
    console.error('Error sending vocab notification:', error);
  }
};
