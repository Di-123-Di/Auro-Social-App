import express from 'express';
import * as notificationModel from './db/notification.model.js';
import * as userModel from './db/user.model.js';
import * as jwtHelpers from './helpers/jwt.js';

const router = express.Router();


const requireAuth = (req, res, next) => {
  const username = jwtHelpers.decrypt(req.cookies.token);
  if (!username) {
    res.status(401).send('Authentication required');
    return;
  }
  req.username = username;
  next();
};


router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await userModel.findUserByUsername(req.username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const notifications = await notificationModel.getUserNotifications(user._id);


    const formattedNotifications = notifications.map(notification => ({
      _id: notification._id,
      fromUser: notification.fromUser.username,
      fromUserAvatar: notification.fromUser.avatar,
      type: notification.type,
      postContent: notification.post?.content,
      postId: notification.post?._id,
      read: notification.read,
      createdAt: notification.createdAt
    }));

    res.json(formattedNotifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const user = await userModel.findUserByUsername(req.username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const count = await notificationModel.getUnreadNotificationsCount(user._id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});


router.put('/:notificationId/read', requireAuth, async (req, res) => {
  try {
    const notification = await notificationModel.markNotificationAsRead(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});


router.put('/read-all', requireAuth, async (req, res) => {
  try {
    const user = await userModel.findUserByUsername(req.username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await notificationModel.markAllNotificationsAsRead(user._id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

export default router;