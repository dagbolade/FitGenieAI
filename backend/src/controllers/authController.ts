// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'default_development_secret';

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName
    });

    // Save user to database
    const savedUser = await user.save();

    // Get user ID
    const userId = savedUser._id.toString();

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email: savedUser.email, role: savedUser.role },
      JWT_SECRET
    );

    // Return user info and token
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role
      },
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Get user ID
    const userId = user._id.toString();

    // Generate JWT token (no expiration)
    const token = jwt.sign(
      { id: userId, email: user.email, role: user.role },
      JWT_SECRET
    );

    // Return user info and token
    res.status(200).json({
      user: {
        id: userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Get current user info
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Error getting user', error });
  }
};