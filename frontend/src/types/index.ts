export enum UserRole {
  CREATOR = 'creator',
  EVENTEE = 'eventee',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum TicketStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  USED = 'used',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum ReminderPeriod {
  ONE_HOUR = '1_hour',
  ONE_DAY = '1_day',
  THREE_DAYS = '3_days',
  ONE_WEEK = '1_week',
  TWO_WEEKS = '2_weeks',
}

export interface User {
  _id: string;
  email: string;
  isEmailVerified?: boolean;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImage?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  creator: string | User;
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
  startDate: string;
  endDate: string;
  ticketPrice: number;
  totalTickets: number;
  availableTickets: number;
  images: string[];
  status: EventStatus;
  defaultReminder: ReminderPeriod;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  _id: string;
  ticketNumber: string;
  event: string | Event;
  user: string | User;
  qrCode: string;
  qrCodeData: string;
  status: TicketStatus;
  purchaseDate: string;
  scannedAt?: string;
  reminder: ReminderPeriod;
  price: number;
  payment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  reference: string;
  user: string | User;
  event: string | Event;
  ticket?: string | Ticket;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paystackReference: string;
  paystackResponse?: unknown;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  totalEvents: number;
  totalAttendees: number;
  totalTicketsSold: number;
  ticketsScanned: number;
  totalRevenue: number;
  averageRevenuePerEvent: number;
}

export interface EventAnalytics {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  status: EventStatus;
  totalTickets: number;
  availableTickets: number;
  ticketsSold: number;
  ticketsScanned: number;
  revenue: number;
  attendanceRate: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items?: T[];
    events?: T[];
    tickets?: T[];
    payments?: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ShareLinks {
  eventUrl: string;
  shareLinks: {
    facebook: string;
    twitter: string;
    linkedin: string;
    whatsapp: string;
    email: string;
  };
}
