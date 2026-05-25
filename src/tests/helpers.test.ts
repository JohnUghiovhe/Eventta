import { describe, expect, it } from '@jest/globals';
import { generateTicketNumber, generateReference, calculateReminderDate, getReminderLabel, sanitizeUser, buildSocialShareLinks } from '../utils/helpers';
import { ReminderPeriod } from '../types';

describe('Helpers Utility Functions', () => {
  describe('generateTicketNumber', () => {
    it('should generate a valid ticket number', () => {
      const ticketNumber = generateTicketNumber();
      expect(ticketNumber).toMatch(/^TKT-[A-Z0-9]+-[A-Z0-9]+$/);
    });

    it('should generate unique ticket numbers', () => {
      const ticket1 = generateTicketNumber();
      const ticket2 = generateTicketNumber();
      expect(ticket1).not.toBe(ticket2);
    });
  });

  describe('generateReference', () => {
    it('should generate a valid reference', () => {
      const reference = generateReference();
      expect(reference).toMatch(/^REF-[A-Z0-9]+-[A-Z0-9]+$/);
    });

    it('should generate unique references', () => {
      const ref1 = generateReference();
      const ref2 = generateReference();
      expect(ref1).not.toBe(ref2);
    });
  });

  describe('calculateReminderDate', () => {
    const eventDate = new Date('2024-12-31T20:00:00Z');

    it('should calculate 1 hour before reminder', () => {
      const reminderDate = calculateReminderDate(eventDate, ReminderPeriod.ONE_HOUR);
      expect(reminderDate.getTime()).toBe(eventDate.getTime() - 60 * 60 * 1000);
    });

    it('should calculate 1 day before reminder', () => {
      const reminderDate = calculateReminderDate(eventDate, ReminderPeriod.ONE_DAY);
      expect(reminderDate.getTime()).toBe(eventDate.getTime() - 24 * 60 * 60 * 1000);
    });

    it('should calculate 1 week before reminder', () => {
      const reminderDate = calculateReminderDate(eventDate, ReminderPeriod.ONE_WEEK);
      expect(reminderDate.getTime()).toBe(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    });
  });

  describe('getReminderLabel', () => {
    it('should return correct label for 1 hour', () => {
      expect(getReminderLabel(ReminderPeriod.ONE_HOUR)).toBe('1 hour before');
    });

    it('should return correct label for 1 day', () => {
      expect(getReminderLabel(ReminderPeriod.ONE_DAY)).toBe('1 day before');
    });

    it('should return correct label for 1 week', () => {
      expect(getReminderLabel(ReminderPeriod.ONE_WEEK)).toBe('1 week before');
    });
  });

  describe('sanitizeUser', () => {
    it('should remove password from user object', () => {
      const user = {
        _id: '123',
        email: 'test@test.com',
        password: 'hashedpassword',
        firstName: 'John',
        toObject: function() { return { ...this }; }
      };

      const sanitized = sanitizeUser(user);
      expect(sanitized).not.toHaveProperty('password');
      expect(sanitized).toHaveProperty('email');
      expect(sanitized).toHaveProperty('firstName');
    });
  });

  describe('buildSocialShareLinks', () => {
    it('should build correct share links', () => {
      const title = 'Test Event';
      const url = 'https://example.com/events/123';
      const links = buildSocialShareLinks(title, url);

      expect(links.facebook).toContain('facebook.com');
      expect(links.twitter).toContain('twitter.com');
      expect(links.linkedin).toContain('linkedin.com');
      expect(links.whatsapp).toContain('wa.me');
      expect(links.email).toContain('mailto:');
    });

    it('should encode URL and title properly', () => {
      const title = 'Test Event & More';
      const url = 'https://example.com/events/123';
      const links = buildSocialShareLinks(title, url);

      expect(links.facebook).toContain(encodeURIComponent(url));
      expect(links.twitter).toContain(encodeURIComponent(title));
    });
  });
});
