import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import storageService from '../services/storageService.js';

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'zyntra_jwt_secret_dev_key_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const formatUserResponse = (user) => ({
  id: user._id || user.id,
  _id: user._id || user.id,
  name: user.name,
  email: user.email,
  primaryUsername: user.primaryUsername,
  avatar: user.avatar || null,
  avatarType: user.avatarType || null,
  bio: user.bio || '',
  contexts: user.contexts || [],
  status: user.status || 'online',
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, primaryUsername, password, avatar, bio } = req.body || {};

    if (!name || !email || !primaryUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, primaryUsername, password',
      });
    }

    const cleanUsername = primaryUsername.replace(/^@/, '').toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // 1. If MongoDB is connected, attempt via Mongoose
    if (mongoose.connection.readyState === 1) {
      try {
        const existingEmail = await User.findOne({ email: cleanEmail });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: 'An account with that email address already exists',
          });
        }

        const existingUsername = await User.findOne({ primaryUsername: cleanUsername });
        if (existingUsername) {
          return res.status(400).json({
            success: false,
            message: `Username @${cleanUsername} is already taken`,
          });
        }

        const user = await User.create({
          name: name.trim(),
          email: cleanEmail,
          primaryUsername: cleanUsername,
          password,
          avatar: avatar || null,
          bio: bio || 'Building contextual communication',
          contexts: [
            {
              id: 'ctx-personal',
              type: 'personal',
              name: 'Personal',
              username: `${cleanUsername}.personal`,
            },
          ],
        });

        const token = generateToken(user._id);
        return res.status(201).json({
          success: true,
          token,
          user: formatUserResponse(user),
        });
      } catch (err) {
        console.warn('[Auth] Mongoose register fallback to storage service:', err.message);
      }
    }

    // 2. Embedded Storage Engine
    try {
      const user = await storageService.createUser({
        name,
        email: cleanEmail,
        primaryUsername: cleanUsername,
        password,
        avatar,
        bio,
      });

      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        token,
        user: formatUserResponse(user),
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. If MongoDB is connected, attempt via Mongoose
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findOne({ email: cleanEmail }).select('+password');
        if (user) {
          const isMatch = await user.matchPassword(password);
          if (isMatch) {
            const token = generateToken(user._id);
            return res.status(200).json({
              success: true,
              token,
              user: formatUserResponse(user),
            });
          }
        }
      } catch (err) {
        console.warn('[Auth] Mongoose login fallback to storage service:', err.message);
      }
    }

    // 2. Embedded Storage Engine
    const user = await storageService.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await storageService.verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      success: true,
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    res.status(200).json({
      success: true,
      user: formatUserResponse(req.user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, phone } = req.body;
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      try {
        const updated = await User.findByIdAndUpdate(
          userId,
          { name, bio, avatar },
          { new: true }
        );
        if (updated) {
          return res.status(200).json({
            success: true,
            user: formatUserResponse(updated),
          });
        }
      } catch {}
    }

    const user = await storageService.updateUserProfile(userId, { name, bio, avatar, phone });
    res.status(200).json({
      success: true,
      user: formatUserResponse(user || req.user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update user context
// @route   POST /api/auth/context
// @access  Private
export const addContext = async (req, res, next) => {
  try {
    const { id, type, name, username } = req.body;
    if (!id || !type || !name || !username) {
      return res.status(400).json({
        success: false,
        message: 'Context requires id, type, name, and username',
      });
    }

    const user = req.user;
    const contexts = user.contexts || [];
    const filtered = contexts.filter((c) => c.id !== id);
    filtered.push({ id, type, name, username });
    user.contexts = filtered;

    res.status(200).json({
      success: true,
      contexts: user.contexts,
    });
  } catch (error) {
    next(error);
  }
};
