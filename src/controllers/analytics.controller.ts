import { Response } from 'express';
import Event from '../models/Event';
import Ticket from '../models/Ticket';
import Payment from '../models/Payment';
import { AuthRequest, TicketStatus, PaymentStatus } from '../types';
import { Logger } from '../utils/logger';

export class AnalyticsController {
  /**
   * Get creator's overall analytics
   */
  static async getOverallAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Get all creator's events
      const events = await Event.find({ creator: req.user!.id });
      const eventIds = events.map((e) => e._id);

      // Get all tickets for these events
      const allTickets = await Ticket.find({
        event: { $in: eventIds as any }
      });

      // Get all payments for these events
      const allPayments = await Payment.find({
        event: { $in: eventIds as any },
        status: PaymentStatus.SUCCESS
      });

      // Calculate metrics
      const totalAttendees = allTickets.filter(
        (t) => t.status === TicketStatus.PAID || t.status === TicketStatus.USED
      ).length;

      const totalTicketsSold = allTickets.length;

      const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);

      const totalEvents = events.length;

      // Get tickets scanned count
      const ticketsScanned = allTickets.filter(
        (t) => t.status === TicketStatus.USED
      ).length;

      res.status(200).json({
        success: true,
        data: {
          totalEvents,
          totalAttendees,
          totalTicketsSold,
          ticketsScanned,
          totalRevenue,
          averageRevenuePerEvent: totalEvents > 0 ? totalRevenue / totalEvents : 0
        }
      });
    } catch (error: unknown) {
      Logger.error('Get overall analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics'
      });
    }
  }

  /**
   * Get analytics for all creator's events
   */
  static async getEventsAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const events = await Event.find({ creator: req.user!.id });

      const eventAnalytics = await Promise.all(
        events.map(async (event) => {
          const tickets = await Ticket.find({ event: event._id as any });

          const payments = await Payment.find({
            event: event._id as any,
            status: PaymentStatus.SUCCESS
          });

          const ticketsSold = tickets.length;
          const ticketsScanned = tickets.filter(
            (t) => t.status === TicketStatus.USED
          ).length;
          const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

          return {
            eventId: event._id,
            eventTitle: event.title,
            eventDate: event.startDate,
            status: event.status,
            totalTickets: event.totalTickets,
            availableTickets: event.availableTickets,
            ticketsSold,
            ticketsScanned,
            revenue,
            attendanceRate:
              ticketsSold > 0 ? (ticketsScanned / ticketsSold) * 100 : 0
          };
        })
      );

      res.status(200).json({
        success: true,
        data: eventAnalytics
      });
    } catch (error: unknown) {
      Logger.error('Get events analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events analytics'
      });
    }
  }

  /**
   * Get analytics for a specific event (Creator only)
   */
  static async getEventAnalytics(req: AuthRequest, res: Response): Promise<void> {
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

      // Get tickets
      const tickets = await Ticket.find({ event: eventId });

      // Get payments
      const payments = await Payment.find({
        event: eventId,
        status: PaymentStatus.SUCCESS
      });

      const ticketsSold = tickets.length;
      const ticketsScanned = tickets.filter(
        (t) => t.status === TicketStatus.USED
      ).length;
      const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

      // Get daily sales data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailySales = await Payment.aggregate([
        {
          $match: {
            event: event._id,
            status: PaymentStatus.SUCCESS,
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$amount' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      res.status(200).json({
        success: true,
        data: {
          event: {
            id: event._id,
            title: event.title,
            startDate: event.startDate,
            endDate: event.endDate,
            status: event.status,
            totalTickets: event.totalTickets,
            availableTickets: event.availableTickets
          },
          metrics: {
            ticketsSold,
            ticketsScanned,
            revenue,
            attendanceRate:
              ticketsSold > 0 ? ((ticketsScanned / ticketsSold) * 100).toFixed(2) : 0,
            salesRate:
              event.totalTickets > 0
                ? ((ticketsSold / event.totalTickets) * 100).toFixed(2)
                : 0
          },
          dailySales
        }
      });
    } catch (error: unknown) {
      Logger.error('Get event analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event analytics'
      });
    }
  }
}

