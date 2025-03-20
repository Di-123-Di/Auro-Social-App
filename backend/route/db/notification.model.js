import mongoose from "mongoose";
import { NotificationSchema } from './notification.schema.js';

const NotificationModel = mongoose.model("Notification", NotificationSchema);

export async function createNotification(notificationData) {
  try {
    return await NotificationModel.create(notificationData);
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
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
    console.error('Failed to get user notifications:', error);
    throw error;
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
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId) {
  try {
    return await NotificationModel.updateMany(
      { recipient: userId, read: false }, 
      { read: true }
    );
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
}

export async function getUnreadNotificationsCount(userId) {
  try {
    return await NotificationModel.countDocuments({
      recipient: userId,
      read: false
    });
  } catch (error) {
    console.error('Failed to get unread notifications count:', error);
    throw error;
  }
}

export async function deleteNotification(notificationId) {
  try {
    return await NotificationModel.findByIdAndDelete(notificationId);
  } catch (error) {
    console.error('Failed to delete notification:', error);
    throw error;
  }
}