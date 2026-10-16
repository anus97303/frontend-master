import express from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { login, getMe, changePassword, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Rate limiter for login route (5 attempts per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // generous for dev/testing, but protective
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  login
);

router.get('/me', protect, getMe);

router.post(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
    validate,
  ],
  changePassword
);

router.post('/logout', protect, logout);

export default router;
