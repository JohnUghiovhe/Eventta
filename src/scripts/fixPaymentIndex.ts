import Payment from '../models/Payment';
import { Logger } from '../utils/logger';

/**
 * Fix the E11000 duplicate key error on payments collection
 * Drops the problematic transactionId unique index that allows multiple null values
 */
export const fixPaymentIndex = async () => {
  try {
    // Get all indexes on the Payment collection
    const collection = Payment.collection;
    const indexes = await collection.getIndexes();

    Logger.info('Existing indexes on payments collection:', JSON.stringify(indexes, null, 2));

    // Check if problematic index exists
    const problematicIndexName = 'transactionId_1';
    if (indexes[problematicIndexName]) {
      Logger.warn(`Found problematic index: ${problematicIndexName}. Dropping it...`);
      
      await collection.dropIndex(problematicIndexName);
      Logger.info(`Successfully dropped index: ${problematicIndexName}`);
    }

    Logger.info('Payment indexes have been fixed');
  } catch (error: unknown) {
    // It's okay if the index doesn't exist
    if (error.message.includes('index not found') || error.message.includes('does not exist')) {
      Logger.info('Problematic index does not exist or was already removed');
    } else {
      Logger.warn('Error fixing payment index:', error.message);
    }
  }
};

