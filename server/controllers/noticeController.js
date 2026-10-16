import Notice from '../models/Notice.js';
import { successResponse, errorResponse } from '../utils/response.js';

// @desc    Get all active notices (role-filtered)
// @route   GET /api/notices
// @access  Private
export const getNotices = async (req, res, next) => {
  try {
    const role = req.user.role;
    const query = { isActive: true };

    if (role !== 'admin') {
      query.$or = [{ targetRole: 'all' }, { targetRole: role }];
    }

    const notices = await Notice.find(query)
      .populate('author', 'name email role')
      .sort({ date: -1 });

    return successResponse(res, 'Notices retrieved successfully', notices);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new notice
// @route   POST /api/notices
// @access  Private (Admin only)
export const createNotice = async (req, res, next) => {
  try {
    const { title, content, targetRole, priority, expiresAt } = req.body;

    const notice = await Notice.create({
      title,
      content,
      targetRole: targetRole || 'all',
      priority: priority || 'medium',
      author: req.user._id,
      expiresAt: expiresAt || null,
    });

    const populated = await Notice.findById(notice._id).populate('author', 'name email role');
    return successResponse(res, 'Notice posted successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private (Admin only)
export const updateNotice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await Notice.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('author', 'name email role');

    if (!updated) {
      return errorResponse(res, 'Notice not found', 404);
    }

    return successResponse(res, 'Notice updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notice (Soft delete)
// @route   DELETE /api/notices/:id
// @access  Private (Admin only)
export const deleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!notice) {
      return errorResponse(res, 'Notice not found', 404);
    }

    return successResponse(res, 'Notice removed successfully (soft delete)');
  } catch (error) {
    next(error);
  }
};
