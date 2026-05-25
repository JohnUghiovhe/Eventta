import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../types';
import { Logger } from '../utils/logger';
import { getPaginationParams } from '../utils/helpers';

export class NotificationController {

  /**
   * Create a new notification
   */
  static async createNotification(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { title, message, type, data } = req.body;

      // Validate required fields
      if (!title || !message) {
        res.status(400).json({
          success: false,
          message: 'Title and message are required'
        });
        return;
      }

      const notification = await Notification.create({
        user: req.user!.id,
        title,
        message,
        type: type || 'info',
        data: data || {},
        read: false
      });

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: notification
      });
    } catch (error: unknown) {
      Logger.error('Create notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create notification'
      });
    }
  }

  /**
   * Get user's notifications (paginated)
   */
  static async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, skip } = getPaginationParams(
        req.query.page as string,
        req.query.limit as string
      );
      const { type, read } = req.query;

      // Build filter
      const filter: any = { user: req.user!.id };
      if (type) {
        filter.type = type;
      }
      if (read !== undefined) {
        filter.read = read === 'true';
      }

      const notifications = await Notification.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Notification.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          notifications,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: unknown) {
      Logger.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications'
      });
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const unreadCount = await Notification.countDocuments({
        user: req.user!.id,
        read: false
      });

      res.status(200).json({
        success: true,
        data: {
          unreadCount
        }
      });
    } catch (error: unknown) {
      Logger.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch unread count'
      });
    }
  }

  /**
   * Get single notification by ID
   */
  static async getNotificationById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const notification = await Notification.findOne({
        _id: id,
        user: req.user!.id
      });

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error: unknown) {
      Logger.error('Get notification by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notification'
      });
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const notification = await Notification.findOneAndUpdate(
        { _id: id, user: req.user!.id },
        { read: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error: unknown) {
      Logger.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read'
      });
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await Notification.updateMany(
        { user: req.user!.id, read: false },
        { read: true, readAt: new Date() }
      );

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        data: {
          modifiedCount: result.modifiedCount
        }
      });
    } catch (error: unknown) {
      Logger.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read'
      });
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const notification = await Notification.findOneAndDelete({
        _id: id,
        user: req.user!.id
      });

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error: unknown) {
      Logger.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification'
      });
    }
  }

  /**
   * Delete all notifications
   */
  static async deleteAllNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await Notification.deleteMany({ user: req.user!.id });

      res.status(200).json({
        success: true,
        message: 'All notifications deleted',
        data: {
          deletedCount: result.deletedCount
        }
      });
    } catch (error: unknown) {
      Logger.error('Delete all notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notifications'
      });
    }
  }
}

