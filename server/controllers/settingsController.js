import SchoolSettings from '../models/SchoolSettings.js';
import { successResponse } from '../utils/response.js';

// @desc    Get school settings / profile
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res, next) => {
  try {
    let settings = await SchoolSettings.findOne();
    if (!settings) {
      settings = await SchoolSettings.create({});
    }
    return successResponse(res, 'School settings retrieved', settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update school settings
// @route   PUT /api/settings
// @access  Private (Admin only)
export const updateSettings = async (req, res, next) => {
  try {
    let settings = await SchoolSettings.findOne();
    if (!settings) {
      settings = await SchoolSettings.create(req.body);
    } else {
      settings = await SchoolSettings.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true,
      });
    }
    return successResponse(res, 'School settings updated successfully', settings);
  } catch (error) {
    next(error);
  }
};
