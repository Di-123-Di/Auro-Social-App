import mongoose from "mongoose";
import { NotificationSchema } from './notification.schema.js';

const NotificationModel = mongoose.model("Notification", NotificationSchema);

export async function createNotification(notificationData) {
  try {
    return await NotificationModel.create(notificationData);
  } catch (error) {
    return null; 
  }
}

export async function getUserNotifications(userId) {
  try {
    return await NotificationModel.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate('fromUser', 'username avatar')
      .populate('post', 'content')
      .lean();
  } catch (error) {
    return []; 
  }
}

export async function markNotificationAsRead(notificationId) {
  try {
    return await NotificationModel.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  } catch (error) {
    return null;
  }
}

export async function markAllNotificationsAsRead(userId) {
  try {
    return await NotificationModel.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );
  } catch (error) {
    return { nModified: 0 }; 
  }
}

export async function getUnreadNotificationsCount(userId) {
  try {
    return await NotificationModel.countDocuments({
      recipient: userId,
      read: false
    });
  } catch (error) {
    return 0; 
  }
}

export async function deleteNotification(notificationId) {
  try {
    return await NotificationModel.findByIdAndDelete(notificationId);
  } catch (error) {
    return null;
  }
}