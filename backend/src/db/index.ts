import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitgenieai';
    await mongoose.connect(connectionString);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};