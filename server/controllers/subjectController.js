import Subject from '../models/Subject.js';
import { successResponse, errorResponse } from '../utils/response.js';

// @desc    Get subjects (optionally by classId)
// @route   GET /api/subjects
// @access  Private
export const getSubjects = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const query = { isActive: true };
    if (classId) query.classId = classId;

    const subjects = await Subject.find(query)
      .populate('classId', 'name grade section')
      .populate('teacherId', 'firstName lastName email teacherId avatar')
      .sort({ name: 1 });

    return successResponse(res, 'Subjects retrieved successfully', subjects);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Admin only)
export const createSubject = async (req, res, next) => {
  try {
    const { name, code, classId, teacherId, type } = req.body;

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      classId,
      teacherId: teacherId || null,
      type: type || 'Core',
    });

    const populated = await Subject.findById(subject._id)
      .populate('classId', 'name grade section')
      .populate('teacherId', 'firstName lastName teacherId');

    return successResponse(res, 'Subject created successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin only)
export const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.code) {
      updates.code = updates.code.toUpperCase();
    }

    const updated = await Subject.findOneAndUpdate(
      { _id: id, isActive: true },
      updates,
      { new: true, runValidators: true }
    )
      .populate('classId', 'name grade section')
      .populate('teacherId', 'firstName lastName teacherId');

    if (!updated) {
      return errorResponse(res, 'Subject not found', 404);
    }

    return successResponse(res, 'Subject updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject (Soft Delete)
// @route   DELETE /api/subjects/:id
// @access  Private (Admin only)
export const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!subject) {
      return errorResponse(res, 'Subject not found', 404);
    }

    return successResponse(res, 'Subject deleted successfully');
  } catch (error) {
    next(error);
  }
};
