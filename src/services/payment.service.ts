import axios from 'axios';
import { Logger } from '../utils/logger';
import { config } from '../config/environment';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Get frontend URL from config (defaults to http://localhost:5173 for dev, https://yourdomain.com for prod)
const FRONTEND_URL = config.FRONTEND_URL;

// Check if Paystack is properly configured
const isPaystackConfigured = () => {
  return PAYSTACK_SECRET_KEY && PAYSTACK_SECRET_KEY.trim().length > 0;
};

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    paid_at: string;
    channel: string;
    currency: string;
    customer: {
      email: string;
    };
    metadata?: Record<string, unknown>;
  };
}

export class PaymentService {
  /**
   * Initialize a payment transaction
   */
  static async initializePayment(
    email: string,
    amount: number,
    reference: string,
    metadata?: Record<string, unknown>
  ): Promise<PaystackInitializeResponse> {
    try {
      // Check if Paystack is configured
      if (!isPaystackConfigured()) {
        Logger.warn('Paystack not configured. Using demo mode.');
        // Return mock response for demo/testing
        return {
          status: true,
          message: 'Demo payment initialized',
          data: {
            authorization_url: `${FRONTEND_URL}/payment/success?reference=${reference}&demo=true`,
            access_code: 'demo_access_code',
            reference: reference
          }
        };
      }

      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Convert to kobo
          reference,
          metadata,
          callback_url: `${FRONTEND_URL}/payment/success`
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      Logger.info(`Payment initialized for ${email}: ${reference}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as any;
      Logger.error('Paystack initialization failed:', err?.response?.data || err?.message || err);
      throw new Error(err?.response?.data?.message || err?.message || 'Failed to initialize payment');
    }
  }

  // Verify a payment transaction    
  static async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    try {
      // Check if Paystack is configured
      if (!isPaystackConfigured()) {
        Logger.warn('Paystack not configured. Using demo mode verification.');
        // Return mock verification response for demo/testing
        return {
          status: true,
          message: 'Demo payment verified',
          data: {
            reference: reference,
            amount: 0,
            status: 'success',
            paid_at: new Date().toISOString(),
            channel: 'demo',
            currency: 'NGN',
            customer: {
              email: 'demo@example.com'
            }
          }
        };
      }

      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
          }
        }
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as any;
      Logger.error('Paystack verification failed:', err?.response?.data || err);
      throw new Error(err?.response?.data?.message || err?.message || 'Failed to verify payment');
    }
  }

  // Get payment details
  static async getPaymentDetails(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
          }
        }
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as any;
      Logger.error('Failed to fetch payment details:', err?.response?.data || err);
      throw new Error(err?.response?.data?.message || err?.message || 'Failed to fetch payment details');
    }
  }

  // List all transactions for a user
  static async listTransactions(email?: string, page: number = 1): Promise<unknown> {
    try {
      const params: Record<string, unknown> = { page, perPage: 50 };
      if (email) params.customer = email;

      const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        },
        params
      });

      return response.data;
    } catch (error: unknown) {
      const err = error as any;
      Logger.error('Failed to list transactions:', err?.response?.data || err);
      throw new Error(err?.response?.data?.message || err?.message || 'Failed to list transactions');
    }
  }
}

