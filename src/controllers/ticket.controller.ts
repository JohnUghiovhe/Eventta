import { Response } from 'express';
import Ticket from '../models/Ticket';
import Event from '../models/Event';
import User from '../models/User';
import { AuthRequest, TicketStatus, IEvent } from '../types';
import { NotificationService } from '../services/notification.service';
import { QRCodeService } from '../services/qrcode.service';
import { Logger } from '../utils/logger';
import {
  calculateReminderDate,
  getPaginationParams,
  generateTicketNumber
} from '../utils/helpers';

export class TicketController {
  /**
   * Get user's tickets (Eventee only)
   */
  static async getMyTickets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, skip } = getPaginationParams(
        req.query.page as string,
        req.query.limit as string
      );

      const tickets = await Ticket.find({ user: req.user!.id })
        .populate('event', 'title startDate endDate venue location images')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Ticket.countDocuments({ user: req.user!.id });

      res.status(200).json({
        success: true,
        data: {
          tickets,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: unknown) {
      Logger.error('Get my tickets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tickets'
      });
    }
  }

  /**
   * Get ticket by ID
   */
  static async getTicketById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const ticket = await Ticket.findOne({
        _id: id,
        user: req.user!.id
      }).populate('event', 'title startDate endDate venue location images creator');

      if (!ticket) {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: ticket
      });
    } catch (error: unknown) {
      Logger.error('Get ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ticket'
      });
    }
  }

  /**
   * Verify ticket with QR code (Creator only)
   */
  static async verifyTicket(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ticketNumber } = req.params;

      const ticket = await Ticket.findOne({ ticketNumber })
        .populate('event')
        .populate('user', 'firstName lastName email');

      if (!ticket) {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }

      const event = ticket.event as unknown as IEvent;

      // Check if the current user is the event creator
      const eventCreatorId = event.creator?.toString() || event.creator;
      const currentUserId = req.user!.id?.toString() || req.user!.id;
      
      Logger.info('Ticket verification authorization:', {
        eventCreatorId,
        currentUserId,
        ticketNumber,
        match: eventCreatorId === currentUserId
      });

      if (eventCreatorId !== currentUserId) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized: You are not the event creator'
        });
        return;
      }

      // Check if ticket is already used
      if (ticket.status === TicketStatus.USED) {
        res.status(400).json({
          success: false,
          message: 'Ticket already used',
          data: {
            scannedAt: ticket.scannedAt
          }
        });
        return;
      }

      // Check if payment is successful
      if (ticket.status !== TicketStatus.PAID) {
        res.status(400).json({
          success: false,
          message: 'Ticket payment not confirmed'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Ticket verified',
        data: {
          ticket,
          valid: true
        }
      });
    } catch (error: unknown) {
      Logger.error('Verify ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify ticket'
      });
    }
  }

  /**
   * Scan/Mark ticket as used (Creator only)
   */
  static async scanTicket(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ticketNumber } = req.params;

      const ticket = await Ticket.findOne({ ticketNumber }).populate('event');

      if (!ticket) {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }

      const event = ticket.event as unknown as IEvent;

      // Check if the current user is the event creator
      const eventCreatorId = event.creator?.toString() || event.creator;
      const currentUserId = req.user!.id?.toString() || req.user!.id;

      if (eventCreatorId !== currentUserId) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized: You are not the event creator'
        });
        return;
      }

      // Check if already scanned
      if (ticket.status === TicketStatus.USED) {
        res.status(400).json({
          success: false,
          message: 'Ticket already scanned',
          data: { scannedAt: ticket.scannedAt }
        });
        return;
      }

      // Mark as used
      ticket.status = TicketStatus.USED;
      ticket.scannedAt = new Date();
      await ticket.save();

      res.status(200).json({
        success: true,
        message: 'Ticket scanned successfully',
        data: ticket
      });
    } catch (error: unknown) {
      Logger.error('Scan ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to scan ticket'
      });
    }
  }

  /**
   * Update ticket reminder (Eventee only)
   */
  static async updateReminder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reminder } = req.body;

      const ticket = await Ticket.findOne({
        _id: id,
        user: req.user!.id
      }).populate('event');

      if (!ticket) {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }

      const event = ticket.event as unknown as IEvent;
      const newReminderDate = calculateReminderDate(event.startDate, reminder);

      // Update ticket reminder
      ticket.reminder = reminder;
      await ticket.save();

      // Update reminder schedule
      await NotificationService.updateReminderSchedule(ticket._id.toString(), newReminderDate);

      res.status(200).json({
        success: true,
        message: 'Reminder updated successfully',
        data: ticket
      });
    } catch (error: unknown) {
      Logger.error('Update reminder error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update reminder'
      });
    }
  }

  /**
   * Get attendees for an event (Creator only)
   */
  static async getEventAttendees(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;

      // Verify event ownership
      const event = await Event.findOne({
        _id: eventId,
        creator: req.user!.id
      });

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found or unauthorized'
        });
        return;
      }

      const tickets = await Ticket.find({ event: eventId, status: TicketStatus.PAID })
        .populate('user', 'firstName lastName email phoneNumber')
        .sort({ purchaseDate: -1 });

      res.status(200).json({
        success: true,
        data: {
          total: tickets.length,
          attendees: tickets
        }
      });
    } catch (error: unknown) {
      Logger.error('Get event attendees error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendees'
      });
    }
  }

  /**
   * Verify ticket by ticket number and event ID (for verification page)
   */
  static async verifyTicketForEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ticketNumber, eventId } = req.body;

      if (!ticketNumber || !eventId) {
        res.status(400).json({
          success: false,
          message: 'Ticket number and event ID are required'
        });
        return;
      }

      const ticket = await Ticket.findOne({ ticketNumber, event: eventId })
        .populate('event')
        .populate('user', 'firstName lastName email');

      if (!ticket) {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }

      const event = ticket.event as unknown as IEvent;

      // Check if the current user is the event creator
      const eventCreatorId = event.creator?.toString() || event.creator;
      const currentUserId = req.user!.id?.toString() || req.user!.id;

      if (eventCreatorId !== currentUserId) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized: You are not the event creator'
        });
        return;
      }

      // Check ticket status
      if (ticket.status === TicketStatus.USED) {
        res.status(200).json({
          success: true,
          message: 'Ticket already used',
          data: ticket
        });
        return;
      }

      if (ticket.status !== TicketStatus.PAID) {
        res.status(400).json({
          success: false,
          message: 'Ticket payment not confirmed'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Ticket verified',
        data: ticket
      });
    } catch (error: unknown) {
      Logger.error('Verify ticket for event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify ticket'
      });
    }
  }

  /**
   * Mark ticket as used directly
   */
  static async markTicketAsUsed(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const ticket = await Ticket.findById(id).populate('event');

      if (!ticket) {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }

      const event = ticket.event as unknown as IEvent;

      // Check if the current user is the event creator
      const eventCreatorId = event.creator?.toString() || event.creator;
      const currentUserId = req.user!.id?.toString() || req.user!.id;

      if (eventCreatorId !== currentUserId) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized: You are not the event creator'
        });
        return;
      }

      // Mark as used
      ticket.status = TicketStatus.USED;
      ticket.scannedAt = new Date();
      await ticket.save();

      res.status(200).json({
        success: true,
        message: 'Ticket marked as used',
        data: ticket
      });
    } catch (error: unknown) {
      Logger.error('Mark ticket as used error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark ticket as used'
      });
    }
  }

  /**
   * Claim a free ticket (no payment required)
   */
  static async claimFreeTicket(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId, reminder } = req.body;

      // Validate input
      if (!eventId) {
        res.status(400).json({
          success: false,
          message: 'Event ID is required'
        });
        return;
      }

      // Check authentication
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: 'Authentication required. Please login to claim tickets.'
        });
        return;
      }

      // Get event details
      const event = await Event.findById(eventId);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      // Check if event is free
      if (event.ticketPrice > 0) {
        res.status(400).json({
          success: false,
          message: 'This is not a free event. Please use the payment flow.'
        });
        return;
      }

      // Check event status
      if (event.status !== 'published') {
        res.status(400).json({
          success: false,
          message: 'This event is not available for ticket claims'
        });
        return;
      }

      // Check ticket availability
      if (event.availableTickets <= 0) {
        res.status(400).json({
          success: false,
          message: 'Sorry, no tickets are available for this event'
        });
        return;
      }

      // Get user details
      const user = await User.findById(req.user.id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User account not found'
        });
        return;
      }

      // Check if user already has a ticket for this event
      const existingTicket = await Ticket.findOne({
        user: user._id.toString(),
        event: event._id.toString()
      });

      if (existingTicket) {
        res.status(400).json({
          success: false,
          message: 'You already have a ticket for this event',
          data: { ticketId: existingTicket._id }
        });
        return;
      }

      Logger.info(`Claiming free ticket for user ${user.email} for event ${event.title}`);

      // Generate ticket number
      const ticketNumber = generateTicketNumber();

      // Generate QR code
      const qrCodeData = {
        ticketNumber,
        eventId: event._id.toString(),
        userId: user._id.toString(),
        eventTitle: event.title
      };

      const qrCode = await QRCodeService.generateQRCode(qrCodeData);

      // Create ticket
      const ticket = await Ticket.create({
        ticketNumber,
        event: event._id.toString(),
        user: user._id.toString(),
        qrCode,
        qrCodeData: JSON.stringify(qrCodeData),
        status: TicketStatus.PAID,
        price: 0,
        reminder: reminder || event.defaultReminder
      });

      Logger.info(`Free ticket created: ${ticketNumber}`, { ticketId: ticket._id.toString() });

      // Update event available tickets
      event.availableTickets -= 1;
      await event.save();

      // Create reminder
      const reminderDate = calculateReminderDate(
        event.startDate,
        ticket.reminder
      );
      await NotificationService.createReminder(
        user._id.toString(),
        event._id.toString(),
        ticket._id.toString(),
        reminderDate
      );

      // Populate ticket with event details for response
      const populatedTicket = await Ticket.findById(ticket._id)
        .populate('event')
        .populate('user', 'firstName lastName email');

      res.status(201).json({
        success: true,
        message: 'Free ticket claimed successfully',
        data: { ticket: populatedTicket }
      });
    } catch (error: unknown) {
      const err = error as Error;
      Logger.error('Claim free ticket error:', error);
      res.status(500).json({
        success: false,
        message: err?.message || 'Failed to claim free ticket',
        error: process.env.NODE_ENV === 'development' ? err?.message : undefined
      });
    }
  }
}

