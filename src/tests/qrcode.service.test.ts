import { describe, expect, it } from '@jest/globals';
import { QRCodeService } from '../services/qrcode.service';

describe('QRCodeService', () => {
  const ticketData = {
    ticketNumber: 'TKT-123',
    eventId: 'event123',
    userId: 'user123',
    eventTitle: 'Test Event'
  };

  describe('generateQRCode', () => {
    it('should generate a QR code data URL', async () => {
      const qrCode = await QRCodeService.generateQRCode(ticketData);
      expect(qrCode).toBeDefined();
      expect(qrCode).toContain('data:image/png;base64,');
    });

    it('should generate different QR codes for different data', async () => {
      const qrCode1 = await QRCodeService.generateQRCode(ticketData);
      const qrCode2 = await QRCodeService.generateQRCode({
        ...ticketData,
        ticketNumber: 'TKT-456'
      });
      expect(qrCode1).not.toBe(qrCode2);
    });
  });

  describe('verifyQRCodeData', () => {
    it('should verify valid QR code data', () => {
      const qrData = JSON.stringify(ticketData);
      const isValid = QRCodeService.verifyQRCodeData(qrData, ticketData.ticketNumber);
      expect(isValid).toBe(true);
    });

    it('should reject invalid QR code data', () => {
      const qrData = JSON.stringify(ticketData);
      const isValid = QRCodeService.verifyQRCodeData(qrData, 'WRONG-TICKET');
      expect(isValid).toBe(false);
    });

    it('should handle malformed QR code data', () => {
      const isValid = QRCodeService.verifyQRCodeData('invalid-json', ticketData.ticketNumber);
      expect(isValid).toBe(false);
    });
  });

  describe('extractTicketData', () => {
    it('should extract ticket data from QR code', () => {
      const qrData = JSON.stringify(ticketData);
      const extracted = QRCodeService.extractTicketData(qrData);
      expect(extracted).toEqual(ticketData);
    });

    it('should return null for invalid QR code data', () => {
      const extracted = QRCodeService.extractTicketData('invalid-json');
      expect(extracted).toBeNull();
    });
  });
});
