import { Response } from 'express';
import Event from '../models/Event';
import { AuthRequest, EventStatus } from '../types';
import { getCache, setCache, clearCacheByPattern } from '../config/redis';
import { Logger } from '../utils/logger';
import { getPaginationParams, buildShareUrl, buildSocialShareLinks } from '../utils/helpers';

export class EventController {
  /**
   * Create a new event (Creator only)
   */
  static async createEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const eventData = {
        ...req.body,
        creator: req.user!.id,
        availableTickets: req.body.totalTickets
      };

      const event = await Event.create(eventData);

      // Clear cache
      await clearCacheByPattern('events:*');
      await clearCacheByPattern(`creator:${req.user!.id}:events:*`);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event
      });
    } catch (error: unknown) {
      Logger.error('Create event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create event',
        error: error.message
      });
    }
  }

  /**
   * Get all events (with pagination and filters)
   */
  static async getAllEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, skip } = getPaginationParams(
        req.query.page as string,
        req.query.limit as string
      );

      const { category, search } = req.query;

      // Build filter query
      const filter: any = { status: EventStatus.PUBLISHED };
      if (category) filter.category = category;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Try to get from cache
      const cacheKey = `events:${page}:${limit}:${JSON.stringify(filter)}`;
      const cached = await getCache(cacheKey);

      if (cached) {
        const cachedData = JSON.parse(cached);
        res.status(200).json(cachedData);
        return;
      }

      const events = await Event.find(filter)
        .populate('creator', 'firstName lastName email')
        .skip(skip)
        .limit(limit)
        .sort({ startDate: 1 });

      const total = await Event.countDocuments(filter);

      const response = {
        success: true,
        data: {
          events,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

      // Cache for 5 minutes
      await setCache(cacheKey, JSON.stringify(response), 300);

      res.status(200).json(response);
    } catch (error: unknown) {
      Logger.error('Get all events error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events'
      });
    }
  }

  /**
   * Get event by ID
   */
  static async getEventById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Try cache first
      const cacheKey = `event:${id}`;
      const cached = await getCache(cacheKey);

      if (cached) {
        res.status(200).json(JSON.parse(cached));
        return;
      }

      const event = await Event.findById(id).populate(
        'creator',
        'firstName lastName email profileImage'
      );

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      const response = {
        success: true,
        data: event
      };

      // Cache for 10 minutes
      await setCache(cacheKey, JSON.stringify(response), 600);

      res.status(200).json(response);
    } catch (error: unknown) {
      Logger.error('Get event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event'
      });
    }
  }

  /**
   * Get events created by the current user (Creator only)
   */
  static async getMyEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, skip } = getPaginationParams(
        req.query.page as string,
        req.query.limit as string
      );

      const filter = { creator: req.user!.id };

      const events = await Event.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Event.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          events,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: unknown) {
      Logger.error('Get my events error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch your events'
      });
    }
  }

  /**
   * Update event (Creator only, own events)
   */
  static async updateEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const event = await Event.findOne({ _id: id, creator: req.user!.id });

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found or unauthorized'
        });
        return;
      }

      // Update fields
      Object.assign(event, req.body);
      await event.save();

      // Clear cache
      await clearCacheByPattern('events:*');
      await clearCacheByPattern(`event:${id}`);
      await clearCacheByPattern(`creator:${req.user!.id}:events:*`);

      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: event
      });
    } catch (error: unknown) {
      Logger.error('Update event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update event'
      });
    }
  }

  /**
   * Delete event (Creator only, own events)
   */
  static async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const event = await Event.findOneAndDelete({ _id: id, creator: req.user!.id });

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found or unauthorized'
        });
        return;
      }

      // Clear cache
      await clearCacheByPattern('events:*');
      await clearCacheByPattern(`event:${id}`);
      await clearCacheByPattern(`creator:${req.user!.id}:events:*`);

      res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error: unknown) {
      Logger.error('Delete event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete event'
      });
    }
  }

  /**
   * Update event status (Creator only, own events)
   */
  static async updateEventStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['draft', 'published', 'cancelled', 'completed'];
      if (!status || !validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: draft, published, cancelled, completed'
        });
        return;
      }

      const event = await Event.findOne({ _id: id, creator: req.user!.id });

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found or unauthorized'
        });
        return;
      }

      event.status = status;
      await event.save();

      // Clear cache
      await clearCacheByPattern('events:*');
      await clearCacheByPattern(`event:${id}`);
      await clearCacheByPattern(`creator:${req.user!.id}:events:*`);

      res.status(200).json({
        success: true,
        message: 'Event status updated successfully',
        data: event
      });
    } catch (error: unknown) {
      Logger.error('Update event status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update event status'
      });
    }
  }

  /**
   * Get event share links
   */
  static async getShareLinks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const event = await Event.findById(id);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const eventUrl = buildShareUrl(id, baseUrl);
      const shareLinks = buildSocialShareLinks(event.title, eventUrl);

      res.status(200).json({
        success: true,
        data: {
          eventUrl,
          shareLinks
        }
      });
    } catch (error: unknown) {
      Logger.error('Get share links error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate share links'
      });
    }
  }
}

