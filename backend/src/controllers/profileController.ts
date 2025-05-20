// backend/src/controllers/profileController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import UserProfile from '../models/UserProfile';

// Get user profile
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      res.status(200).json({
        message: 'Profile not found, please create one',
        profile: null
      });
      return;
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // @ts-ignore
      res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

// Create or update user profile
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const profileData = req.body;

    // Find and update profile, or create if it doesn't exist
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      {
        ...profileData,
        userId
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    // @ts-ignore
      res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};