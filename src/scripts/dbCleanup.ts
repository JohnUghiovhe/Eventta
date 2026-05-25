/**
 * Manual database cleanup script
 * Run with: npm run db:cleanup
 * 
 * This script can be used to:
 * - Drop problematic indexes
 * - Clean up duplicate payments
 * - Reset payment status for failed transactions
 */

import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import Payment from '../models/Payment';
import { Logger } from '../utils/logger';
import { PaymentStatus } from '../types';

dotenv.config();

const cleanup = async () => {
  try {
    await connectDB();
    Logger.info('Connected to database');

    // Option 1: Drop the problematic transactionId index
    const collection = Payment.collection;
    const indexes = await collection.getIndexes();
    
    Logger.info('Current indexes:');
    Object.keys(indexes).forEach(indexName => {
      Logger.info(`  - ${indexName}: ${JSON.stringify(indexes[indexName])}`);
    });

    // Drop transactionId index if it exists
    if (indexes.transactionId_1) {
      await collection.dropIndex('transactionId_1');
      Logger.info('✓ Dropped transactionId_1 index');
    }

    // Option 2: Remove duplicate payments with null transactionId
    const result = await Payment.deleteMany({
      paystackReference: null,
      status: PaymentStatus.PENDING,
      createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Older than 7 days
    });
    Logger.info(`✓ Removed ${result.deletedCount} old pending payments with no reference`);

    // Option 3: Reset stuck pending payments
    const stuckPayments = await Payment.updateMany(
      {
        status: PaymentStatus.PENDING,
        createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
      },
      {
        status: PaymentStatus.FAILED
      }
    );
    Logger.info(`✓ Reset ${stuckPayments.modifiedCount} old pending payments to failed`);

    Logger.info('Database cleanup completed successfully!');
    process.exit(0);
  } catch (error: unknown) {
    Logger.error('Database cleanup failed:', error);
    process.exit(1);
  }
};

cleanup();

