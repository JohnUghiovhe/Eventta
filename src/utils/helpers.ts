import { ReminderPeriod } from '../types';

export const generateTicketNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TKT-${timestamp}-${random}`;
};

export const generateReference = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `REF-${timestamp}-${random}`;
};

export const calculateReminderDate = (
  eventDate: Date,
  reminderPeriod: ReminderPeriod
): Date => {
  const reminderDate = new Date(eventDate);

  switch (reminderPeriod) {
    case ReminderPeriod.ONE_HOUR:
      reminderDate.setHours(reminderDate.getHours() - 1);
      break;
    case ReminderPeriod.ONE_DAY:
      reminderDate.setDate(reminderDate.getDate() - 1);
      break;
    case ReminderPeriod.THREE_DAYS:
      reminderDate.setDate(reminderDate.getDate() - 3);
      break;
    case ReminderPeriod.ONE_WEEK:
      reminderDate.setDate(reminderDate.getDate() - 7);
      break;
    case ReminderPeriod.TWO_WEEKS:
      reminderDate.setDate(reminderDate.getDate() - 14);
      break;
  }

  return reminderDate;
};

export const getReminderLabel = (reminderPeriod: ReminderPeriod): string => {
  const labels = {
    [ReminderPeriod.ONE_HOUR]: '1 hour before',
    [ReminderPeriod.ONE_DAY]: '1 day before',
    [ReminderPeriod.THREE_DAYS]: '3 days before',
    [ReminderPeriod.ONE_WEEK]: '1 week before',
    [ReminderPeriod.TWO_WEEKS]: '2 weeks before'
  };
  return labels[reminderPeriod];
};

type UserWithOptionalToObject = {
  password?: unknown;
  toObject?: () => Record<string, unknown>;
};

export const sanitizeUser = (user: UserWithOptionalToObject): Record<string, unknown> => {
  const source = user.toObject ? user.toObject() : (user as Record<string, unknown>);
  const { password, ...sanitized } = source;
  return sanitized;
};

export const getPaginationParams = (
  page: string | undefined,
  limit: string | undefined
) => {
  const pageNum = parseInt(page || '1', 10);
  const limitNum = parseInt(limit || '10', 10);
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip
  };
};

export const buildShareUrl = (eventId: string, baseUrl: string): string => {
  return `${baseUrl}/events/${eventId}`;
};

export const buildSocialShareLinks = (eventTitle: string, eventUrl: string) => {
  const encodedUrl = encodeURIComponent(eventUrl);
  const encodedTitle = encodeURIComponent(eventTitle);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
  };
};
