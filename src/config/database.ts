import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || SYSTEM_MESSAGES.defaultMongoUri;

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error);
});
