import jwt from 'jsonwebtoken';
import storageService from '../services/storageService.js';

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
  bio: user.bio || '',
  contexts: user.contexts || [],
  status: user.status || 'online',
});

export const register = async (req, res, next) => {
  try {
    console.log('[Auth] Register attempt:', req.body.email);
    const { name, email, primaryUsername, password, avatar, bio } = req.body || {};

    if (!name || !email || !primaryUsername || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, username, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const cleanUsername = primaryUsername.replace(/^@/, '').toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    try {
      const user = await storageService.createUser({
        name: name.trim(),
        email: cleanEmail,
        primaryUsername: cleanUsername,
        password,
        avatar: avatar || null,
        bio: bio || 'Building contextual communication'
      });

      console.log('[Auth] Registration successful for:', cleanEmail);
      const token = generateToken(user._id);
      
      return res.status(201).json({
        success: true,
        token,
        user: formatUserResponse(user),
      });
    } catch (err) {
      console.error('[Auth] Storage error during register:', err.message);
      // Determine if it's a unique constraint violation
      let errorMsg = 'An error occurred during registration. Please try again.';
      if (err.message.toLowerCase().includes('unique') || err.message.toLowerCase().includes('constraint')) {
        errorMsg = 'An account with that email or username already exists.';
      }
      return res.status(400).json({ success: false, message: errorMsg });
    }
  } catch (error) {
    console.error('[Auth] Server error during register:', error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, username, emailOrUsername, password } = req.body || {};
    const rawIdentifier = email || emailOrUsername || username || '';

    if (!rawIdentifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email or username and password' });
    }

    const cleanIdentifier = rawIdentifier.toLowerCase().trim().replace(/^@/, '');
    console.log('[Auth] Login attempt for:', cleanIdentifier);

    let user = await storageService.findUserByEmail(cleanIdentifier);
    if (!user) {
      user = await storageService.findUserByUsername(cleanIdentifier);
    }

    if (!user) {
      console.warn('[Auth] Login failed: User not found:', cleanIdentifier);
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await storageService.verifyPassword(password, user.password);
    if (!isMatch) {
      console.warn('[Auth] Login failed: Incorrect password for:', cleanIdentifier);
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    console.log('[Auth] Login successful for:', cleanIdentifier);
    const token = generateToken(user._id);
    
    return res.status(200).json({
      success: true,
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('[Auth] Server error during login:', error);
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    res.status(200).json({ success: true, user: formatUserResponse(req.user) });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, phone } = req.body;
    const userId = req.user._id || req.user.id;
    const user = await storageService.updateUserProfile(userId, { name, bio, avatar, phone });
    res.status(200).json({ success: true, user: formatUserResponse(user || req.user) });
  } catch (error) {
    next(error);
  }
};

export const addContext = async (req, res, next) => {
  try {
    const { id, type, name, username } = req.body;
    if (!id || !type || !name || !username) {
      return res.status(400).json({ success: false, message: 'Context requires id, type, name, and username' });
    }
    const user = req.user;
    const contexts = user.contexts || [];
    const filtered = contexts.filter((c) => c.id !== id);
    filtered.push({ id, type, name, username });
    user.contexts = filtered;
    res.status(200).json({ success: true, contexts: user.contexts });
  } catch (error) {
    next(error);
  }
};
