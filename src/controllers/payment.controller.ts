import { Response } from 'express';
import Payment from '../models/Payment';
import Ticket from '../models/Ticket';
import Event from '../models/Event';
import User from '../models/User';
import { AuthRequest, PaymentStatus, TicketStatus } from '../types';
import { PaymentService } from '../services/payment.service';
import { QRCodeService } from '../services/qrcode.service';
import { EmailService } from '../services/email.service';
import { NotificationService } from '../services/notification.service';
import { Logger } from '../utils/logger';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';
import {
  generateTicketNumber,
  generateReference,
  calculateReminderDate
} from '../utils/helpers';

export class PaymentController {
  /**
   * Initialize payment for ticket purchase
   */
  static async initializePayment(req: AuthRequest, res: Response): Promise<void> {
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
          message: 'Authentication required. Please login to purchase tickets.'
        });
        return;
      }

      // Get event details
      const event = await Event.findById(eventId);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found. The event may have been removed.'
        });
        return;
      }

      // Check event status
      if (event.status !== 'published') {
        res.status(400).json({
          success: false,
          message: 'This event is not available for ticket purchase'
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
          message: 'User account not found. Please try logging in again.'
        });
        return;
      }

      Logger.info(`Initializing payment for user ${user.email} for event ${event.title}`);

      // Generate references
      const reference = generateReference();
      const ticketNumber = generateTicketNumber();

      // Create payment record
      const payment: any = await Payment.create({
        reference,
        user: user._id.toString(),
        event: event._id.toString(),
        amount: event.ticketPrice,
        currency: 'NGN',
        status: PaymentStatus.PENDING,
        paystackReference: reference,
        metadata: {
          ticketNumber,
          reminder: reminder || event.defaultReminder
        }
      });

      Logger.info(`Payment record created with reference ${reference}`, { paymentId: payment._id });

      // Initialize Paystack payment
      const paystackResponse = await PaymentService.initializePayment(
        user.email,
        event.ticketPrice,
        reference,
        {
          eventId: event._id,
          eventTitle: event.title,
          ticketNumber,
          userId: user._id
        }
      );

      Logger.info(`Paystack response received for ${reference}`, { status: paystackResponse.status });

      // Update payment with Paystack response
      payment.paystackResponse = paystackResponse;
      await payment.save();

      res.status(200).json({
        success: true,
        message: 'Payment initialized successfully',
        data: {
          paymentUrl: paystackResponse.data.authorization_url,
          reference: paystackResponse.data.reference,
          accessCode: paystackResponse.data.access_code
        }
      });
    } catch (error: unknown) {
      Logger.error('Initialize payment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to initialize payment. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Verify payment and issue ticket
   */
  static async verifyPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { reference } = req.body;

      // Get payment record
      const payment = await Payment.findOne({ reference }).populate('event');
      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
        return;
      }

      // Check if already verified
      if (payment.status === PaymentStatus.SUCCESS) {
        try {
          const ticket = await Ticket.findOne({ payment: payment._id.toString() } as any)
            .populate('event')
            .populate('user', 'firstName lastName email');
          
          if (ticket) {
            Logger.info(`Payment already verified: ${reference}`, { ticketId: ticket._id });
            res.status(200).json({
              success: true,
              message: 'Payment already verified',
              data: { payment, ticket }
            });
            return;
          } else {
            Logger.warn(`Payment marked as success but no ticket found: ${reference}`);
          }
        } catch (error) {
          Logger.error('Error fetching existing ticket:', error);
        }
      }

      // Verify with Paystack
      const paystackResponse = await PaymentService.verifyPayment(reference);

      if (paystackResponse.data.status !== 'success') {
        payment.status = PaymentStatus.FAILED;
        await payment.save();

        res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
        return;
      }

      // Update payment status
      payment.status = PaymentStatus.SUCCESS;
      payment.paystackResponse = paystackResponse;
      await payment.save();

      // Get event and user
      const event: any = payment.event;
      const user = await User.findById(payment.user);

      // Generate QR code
      const qrCodeData = {
        ticketNumber: payment.metadata.ticketNumber,
        eventId: event._id.toString(),
        userId: payment.user.toString(),
        eventTitle: event.title
      };

      const qrCode = await QRCodeService.generateQRCode(qrCodeData);

      // Check if ticket already exists (race condition prevention)
      let ticket: any = await Ticket.findOne({
        ticketNumber: payment.metadata.ticketNumber
      });

      let isNewTicket = false;

      // Create ticket only if it doesn't exist
      if (!ticket) {
        ticket = await Ticket.create({
          ticketNumber: payment.metadata.ticketNumber,
          event: event._id,
          user: payment.user,
          qrCode,
          qrCodeData: JSON.stringify(qrCodeData),
          status: TicketStatus.PAID,
          price: payment.amount,
          payment: payment._id.toString(),
          reminder: payment.metadata.reminder || event.defaultReminder
        });

        isNewTicket = true;
        Logger.info(`Ticket created: ${payment.metadata.ticketNumber}`, { ticketId: ticket._id });
      } else {
        Logger.info(`Ticket already exists: ${payment.metadata.ticketNumber}`, { ticketId: ticket._id });
      }

      // Refetch ticket with populated event and user data
      ticket = await Ticket.findById(ticket._id)
        .populate('event')
        .populate('user', 'firstName lastName email');

      // Update payment with ticket reference (if not already set)
      if (!payment.ticket || payment.ticket.toString() !== ticket._id.toString()) {
        payment.ticket = ticket._id;
        await payment.save();
      }

      // Update event available tickets only if we just created the ticket
      if (isNewTicket && event.availableTickets > 0) {
        event.availableTickets -= 1;
        await event.save();
      }

      // Create reminder only for new tickets
      if (isNewTicket) {
        const reminderDate = calculateReminderDate(
          event.startDate,
          ticket.reminder
        );
        await NotificationService.createReminder(
          payment.user.toString(),
          event._id.toString(),
          ticket._id.toString(),
          reminderDate
        );
      }

      // Send confirmation email asynchronously to avoid blocking the response
      if (isNewTicket && user?.email) {
        setImmediate(async () => {
          try {
            // Get organizer details for email
            let organizerName: string = SYSTEM_MESSAGES.appName;
            if (event.organizer) {
              const organizer = await User.findById(event.organizer);
              if (organizer) {
                organizerName = `${organizer.firstName} ${organizer.lastName}`;
              }
            }

            await EmailService.sendTicketConfirmation(user.email, {
              eventTitle: event.title,
              ticketNumber: ticket.ticketNumber,
              eventDate: event.startDate.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              venue: event.venue,
              qrCode,
              ticketId: ticket._id.toString(),
              eventDescription: event.description,
              eventCategory: event.category,
              ticketPrice: payment.amount,
              organizerName
            });
            Logger.info(`Confirmation email sent to ${user.email} for ticket ${ticket.ticketNumber}`);
          } catch (emailError) {
            Logger.error('Failed to send confirmation email:', emailError);
          }
        });
      }

      Logger.info(`Payment verification successful: ${reference}`, { ticketId: ticket._id });
      res.status(200).json({
        success: true,
        message: 'Payment verified and ticket issued',
        data: {
          payment,
          ticket
        }
      });
    } catch (error: unknown) {
      Logger.error('Verify payment error:', error);
      console.error('Verify payment error details:', {
        message: error.message,
        stack: error.stack,
        reference: req.body.reference
      });
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to verify payment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get payment status (polling endpoint)
   */
  static async getPaymentStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { reference } = req.params;

      const payment = await Payment.findOne({ reference }).populate('event');
      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
        return;
      }

      let ticket = null;
      if (payment.status === PaymentStatus.SUCCESS) {
        ticket = await Ticket.findOne({ payment: payment._id.toString() } as any)
          .populate('event')
          .populate('user', 'firstName lastName email');
      }

      res.status(200).json({
        success: true,
        data: {
          payment,
          ticket,
          status: payment.status
        }
      });
    } catch (error: unknown) {
      Logger.error('Get payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment status'
      });
    }
  }

  /**
   * Get user's payment history
   */
  static async getMyPayments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const payments = await Payment.find({ user: req.user!.id })
        .populate('event', 'title startDate venue images')
        .populate('ticket', 'ticketNumber status')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: payments
      });
    } catch (error: unknown) {
      Logger.error('Get my payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payments'
      });
    }
  }

  /**
   * Get event payments (Creator only)
   */
  static async getEventPayments(req: AuthRequest, res: Response): Promise<void> {
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

      const payments = await Payment.find({ event: eventId })
        .populate('user', 'firstName lastName email')
        .populate('ticket', 'ticketNumber status')
        .sort({ createdAt: -1 });

      const totalRevenue = payments
        .filter((p) => p.status === PaymentStatus.SUCCESS)
        .reduce((sum, p) => sum + p.amount, 0);

      res.status(200).json({
        success: true,
        data: {
          payments,
          totalRevenue,
          totalTransactions: payments.length
        }
      });
    } catch (error: unknown) {
      Logger.error('Get event payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event payments'
      });
    }
  }

  /**
   * Initialize demo payment (for testing without Paystack)
   */
  static async initializeDemoPayment(req: AuthRequest, res: Response): Promise<void> {
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
          message: 'Authentication required. Please login to purchase tickets.'
        });
        return;
      }

      // Get event details
      const event = await Event.findById(eventId);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found. The event may have been removed.'
        });
        return;
      }

      // Check event status
      if (event.status !== 'published') {
        res.status(400).json({
          success: false,
          message: 'This event is not available for ticket purchase'
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
          message: 'User account not found. Please try logging in again.'
        });
        return;
      }

      Logger.info(`Initializing DEMO payment for user ${user.email} for event ${event.title}`);

      // Generate references
      const reference = `DEMO-${generateReference()}`;
      const ticketNumber = generateTicketNumber();

      // Create payment record with SUCCESS status for demo
      const payment: any = await Payment.create({
        reference,
        user: user._id.toString(),
        event: event._id.toString(),
        amount: event.ticketPrice,
        currency: 'NGN',
        status: PaymentStatus.SUCCESS,
        paystackReference: reference,
        metadata: {
          ticketNumber,
          reminder: reminder || event.defaultReminder,
          isDemo: true
        },
        paystackResponse: {
          status: true,
          message: 'Demo payment - no actual transaction',
          data: {
            authorization_url: '#',
            access_code: 'demo_access_code',
            reference
          }
        }
      });

      Logger.info(`Demo payment record created with reference ${reference}`, { paymentId: payment._id });

      // Generate QR code for ticket
      const qrCodeData = {
        ticketNumber,
        eventId: event._id.toString(),
        userId: user._id.toString(),
        eventTitle: event.title,
        eventDate: event.startDate
      };
      const qrCode = await QRCodeService.generateQRCode(qrCodeData);

      // Create ticket immediately
      const ticket: any = await Ticket.create({
        ticketNumber,
        event: event._id.toString(),
        user: user._id.toString(),
        qrCode,
        qrCodeData: JSON.stringify(qrCodeData),
        status: TicketStatus.PAID,
        price: event.ticketPrice,
        payment: payment._id.toString(),
        reminder: reminder || event.defaultReminder
      });

      Logger.info(`Demo ticket created: ${ticketNumber}`, { ticketId: ticket._id });

      // Update event tickets
      if (event.availableTickets > 0) {
        event.availableTickets -= 1;
        await event.save();
      }

      // Create reminder
      const reminderDate = calculateReminderDate(event.startDate, ticket.reminder);
      await NotificationService.createReminder(
        user._id.toString(),
        event._id.toString(),
        ticket._id.toString(),
        reminderDate
      );

      // Send confirmation email asynchronously to avoid blocking the response
      if (user?.email) {
        setImmediate(async () => {
          try {
            await EmailService.sendTicketConfirmation(user.email, {
              eventTitle: event.title,
              ticketNumber: ticket.ticketNumber,
              eventDate: event.startDate.toLocaleString(),
              venue: event.venue,
              qrCode
            });
          } catch (emailError) {
            Logger.error('Failed to send demo confirmation email:', emailError);
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Demo payment completed successfully! Ticket issued.',
        data: {
          payment: {
            reference: payment.reference,
            amount: payment.amount,
            status: payment.status,
            isDemo: true
          },
          ticket: {
            ticketNumber: ticket.ticketNumber,
            qrCode: ticket.qrCode,
            status: ticket.status,
            eventTitle: event.title,
            eventDate: event.startDate,
            venue: event.venue
          }
        }
      });
    } catch (error: unknown) {
      Logger.error('Initialize demo payment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to initialize demo payment. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

