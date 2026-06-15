import schedule from 'node-schedule';
import Reminder from '../models/Reminder';
import Notification from '../models/Notification';
import User from '../models/User';
import Event from '../models/Event';
import Ticket from '../models/Ticket';
import { Logger } from '../utils/logger';
import { NotificationType, IUser, IEvent, ITicket, IReminder } from '../types';

export class NotificationService {
//  Start the notification scheduler
 
  static startScheduler(): void {
    // Run every 5 minutes to check for pending reminders
    schedule.scheduleJob('*/5 * * * *', async () => {
      Logger.info('Checking for pending reminders...');
      await this.processPendingReminders();
    });

    Logger.info('✅ Notification scheduler started');
  }

  // Process pending reminders
  static async processPendingReminders(): Promise<void> {
    try {
      const now = new Date();
      const reminders = await Reminder.find({
        scheduledFor: { $lte: now },
        sent: false
      })
        .populate('user')
        .populate('event')
        .populate('ticket')
        .limit(50);

      Logger.info(`Found ${reminders.length} pending reminders`);

      for (const reminder of reminders) {
        try {
          const result = await this.sendReminder(reminder);

          if (result === 'sent' || result === 'skipped') {
            reminder.sent = true;
            reminder.sentAt = new Date();
            await reminder.save();
          }
        } catch (error) {
          Logger.error(`Failed to send reminder ${reminder._id}:`, error);
        }
      }
    } catch (error) {
      Logger.error('Error processing reminders:', error);
    }
  }

  // Send a single reminder
  static async sendReminder(reminder: IReminder): Promise<'sent' | 'skipped'> {
    const user = await this.resolveUser(reminder.user as string | IUser);
    const event = await this.resolveEvent(reminder.event as string | IEvent);
    const ticket = await this.resolveTicket(reminder.ticket as string | ITicket);

    if (!user || !event || !ticket) {
      Logger.warn(
        `Skipping reminder ${reminder._id} due to missing relation(s): user=${Boolean(user)} event=${Boolean(event)} ticket=${Boolean(ticket)}`
      );
      return 'skipped';
    }

    if (!user.email) {
      Logger.warn(`Skipping reminder ${reminder._id}: user has no email`);
      return 'skipped';
    }

    Logger.info(`Reminder sent to ${user.email} for event ${event.title}`);
    return 'sent';
  }

  private static async resolveUser(userRef: string | IUser | null): Promise<IUser | null> {
    if (!userRef) return null;
    if (typeof userRef === 'object' && (userRef as IUser).email) return userRef as IUser;
    return User.findById(String(userRef));
  }

  private static async resolveEvent(eventRef: string | IEvent | null): Promise<IEvent | null> {
    if (!eventRef) return null;
    if (typeof eventRef === 'object' && (eventRef as IEvent).title) return eventRef as IEvent;
    return Event.findById(String(eventRef));
  }

  private static async resolveTicket(ticketRef: string | ITicket | null): Promise<ITicket | null> {
    if (!ticketRef) return null;
    if (typeof ticketRef === 'object' && (ticketRef as ITicket).ticketNumber) return ticketRef as ITicket;
    return Ticket.findById(String(ticketRef));
  }

  // Create a reminder for a ticket 
  static async createReminder(
    userId: string,
    eventId: string,
    ticketId: string,
    scheduledFor: Date
  ): Promise<void> {
    try {
      await Reminder.create({
        user: userId,
        event: eventId,
        ticket: ticketId,
        scheduledFor,
        sent: false
      });

      Logger.info(`Reminder created for ticket ${ticketId}`);
    } catch (error) {
      Logger.error('Failed to create reminder:', error);
    }
  }

  // Cancel reminders for a ticket
  static async cancelReminders(ticketId: string): Promise<void> {
    try {
      await Reminder.deleteMany({ ticket: ticketId });
      Logger.info(`Reminders cancelled for ticket ${ticketId}`);
    } catch (error) {
      Logger.error('Failed to cancel reminders:', error);
    }
  }

  // Update reminder schedule
  static async updateReminderSchedule(
    ticketId: string,
    newScheduledFor: Date
  ): Promise<void> {
    try {
      await Reminder.updateMany(
        { ticket: ticketId, sent: false },
        { scheduledFor: newScheduledFor }
      );
      Logger.info(`Reminder schedule updated for ticket ${ticketId}`);
    } catch (error) {
      Logger.error('Failed to update reminder schedule:', error);
    }
  }

  // Create in-app notification
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    data?: Record<string, unknown>
  ): Promise<void> {
    try {
      await Notification.create({
        user: userId,
        title,
        message,
        type,
        data: data || {},
        read: false
      });

      Logger.info(`Notification created for user ${userId}: ${title}`);
    } catch (error) {
      Logger.error('Failed to create notification:', error);
    }
  }

  // Create notification for event payment  
  static async notifyPaymentSuccess(
    userId: string,
    eventTitle: string,
    ticketNumber: string,
    eventId: string,
    ticketId: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Payment Successful',
      `Your payment for "${eventTitle}" is confirmed. Ticket: ${ticketNumber}`,
      NotificationType.PAYMENT,
      { eventId, ticketId }
    );
  }

  // Create notification for event created
  static async notifyEventCreated(
    userId: string,
    eventTitle: string,
    eventId: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Event Created',
      `Your event "${eventTitle}" has been created successfully.`,
      NotificationType.EVENT,
      { eventId }
    );
  }

  // Create notification for event published
  static async notifyEventPublished(
    userId: string,
    eventTitle: string,
    eventId: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Event Published',
      `Your event "${eventTitle}" is now live and accepting bookings.`,
      NotificationType.EVENT,
      { eventId }
    );
  }

  // Create notification for event cancelled
  static async notifyEventCancelled(
    userId: string,
    eventTitle: string,
    eventId: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Event Cancelled',
      `Your event "${eventTitle}" has been cancelled.`,
      NotificationType.WARNING,
      { eventId }
    );
  }

  // Create notification for ticket purchase
  static async notifyTicketPurchased(
    userId: string,
    eventTitle: string,
    ticketNumber: string,
    eventId: string,
    ticketId: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Ticket Purchased',
      `You have successfully purchased a ticket for "${eventTitle}". Ticket #: ${ticketNumber}`,
      NotificationType.TICKET,
      { eventId, ticketId }
    );
  }

  // Create notification for ticket scanned
  static async notifyTicketScanned(
    userId: string,
    eventTitle: string,
    ticketNumber: string,
    eventId: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Ticket Scanned',
      `Ticket ${ticketNumber} for "${eventTitle}" has been scanned at the event.`,
      NotificationType.SUCCESS,
      { eventId, ticketNumber }
    );
  }

  // Delete old read notifications (cleanup)
  static async cleanupOldNotifications(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        read: true,
        createdAt: { $lt: cutoffDate }
      });

      Logger.info(`Cleaned up ${result.deletedCount} old read notifications`);
    } catch (error) {
      Logger.error('Failed to cleanup old notifications:', error);
    }
  }
}
