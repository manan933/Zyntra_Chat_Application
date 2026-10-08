import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  addContext,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/diagnostic', async (req, res) => {
  try {
    const { db } = await import('../config/turso.js');
    const users = await db.execute('SELECT _id, email, primaryUsername FROM users');
    res.json({ success: true, count: users.rows.length, users: users.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/context', protect, addContext);

export default router;
