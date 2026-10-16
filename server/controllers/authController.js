import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_school_jwt_key_2026_antigravity',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide an email and password', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account is deactivated. Contact administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    // Populate extra profile details if student or teacher
    let profileData = null;
    if (user.role === 'student' && user.referenceId) {
      profileData = await Student.findById(user.referenceId).populate('classId', 'name grade section');
    } else if (user.role === 'teacher' && user.referenceId) {
      profileData = await Teacher.findById(user.referenceId).populate('assignedClasses', 'name grade section');
    }

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      referenceId: user.referenceId,
      profile: profileData,
    };

    return successResponse(res, 'Logged in successfully', {
      user: userData,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    let profileData = null;
    if (user.role === 'student' && user.referenceId) {
      profileData = await Student.findById(user.referenceId).populate('classId', 'name grade section');
    } else if (user.role === 'teacher' && user.referenceId) {
      profileData = await Teacher.findById(user.referenceId).populate('assignedClasses', 'name grade section');
    }

    return successResponse(res, 'User profile fetched', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        referenceId: user.referenceId,
        profile: profileData,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change current user password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Please provide both current and new password', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters', 400);
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  return successResponse(res, 'Logged out successfully');
};
