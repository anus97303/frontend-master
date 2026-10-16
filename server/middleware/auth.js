import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/response.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Not authorized, no token provided', 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_school_jwt_key_2026_antigravity'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(res, 'User not found or token invalid', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated. Please contact admin.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired, please login again', 401);
    }
    return errorResponse(res, 'Invalid token authorization', 401);
  }
};
