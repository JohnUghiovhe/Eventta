import { Request } from 'express';
import { Document } from 'mongoose';

export enum UserRole {
  CREATOR = 'creator',
  EVENTEE = 'eventee'
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum TicketStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  USED = 'used'
}

// Alias for service compatibility
export const TICKET_STATUS_USED = 'used';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  COMPLETED = 'completed',
  REFUNDED = 'refunded'
}

export enum ReminderPeriod {
  ONE_HOUR = '1_hour',
  ONE_DAY = '1_day',
  THREE_DAYS = '3_days',
  ONE_WEEK = '1_week',
  TWO_WEEKS = '2_weeks'
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  EVENT = 'event',
  PAYMENT = 'payment',
  TICKET = 'ticket'
}

export interface IUser extends Document {
  email: string;
  password: string;
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImage?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  creator: string;
  category: string;
  venue: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  startDate: Date;
  endDate: Date;
  ticketPrice: number;
  totalTickets: number;
  availableTickets: number;
  images: string[];
  status: EventStatus;
  defaultReminder: ReminderPeriod;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITicket extends Document {
  ticketNumber: string;
  event: string;
  user: string;
  qrCode: string;
  qrCodeData: string;
  status: TicketStatus;
  purchaseDate: Date;
  scannedAt?: Date;
  usedAt?: Date;
  reminder: ReminderPeriod;
  price: number;
  payment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment extends Document {
  reference: string;
  user: string;
  event: string;
  ticket: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paystackReference: string;
  paystackAuthorizationUrl?: string;
  paystackResponse?: unknown;
  metadata?: unknown;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReminder extends Document {
  user: string;
  event: string;
  ticket: string;
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: {
    eventId?: string;
    ticketId?: string;
    paymentId?: string;
    [key: string]: unknown;
  };
  read: boolean;
  readAt?: Date;
  scheduledFor?: Date;
  sent?: boolean;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AnalyticsData {
  totalAttendees: number;
  totalTicketsSold: number;
  totalRevenue: number;
  eventAnalytics?: {
    eventId: string;
    eventTitle: string;
    ticketsSold: number;
    ticketsScanned: number;
    revenue: number;
  }[];
}
