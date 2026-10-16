import Class from '../models/Class.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import { successResponse, errorResponse } from '../utils/response.js';

// @desc    Get all classes with student count & subjects
// @route   GET /api/classes
// @access  Private
export const getClasses = async (req, res, next) => {
  try {
    const { academicYear } = req.query;
    const query = { isActive: true };
    if (academicYear) query.academicYear = academicYear;

    const classes = await Class.find(query)
      .populate('classTeacher', 'firstName lastName email phone avatar teacherId')
      .sort({ grade: 1, section: 1 });

    // Attach student count and subject count to each class
    const enhancedClasses = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await Student.countDocuments({ classId: cls._id, isActive: true });
        const subjectCount = await Subject.countDocuments({ classId: cls._id, isActive: true });
        return {
          ...cls.toObject(),
          studentCount,
          subjectCount,
        };
      })
    );

    return successResponse(res, 'Classes retrieved successfully', enhancedClasses);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single class with students and subjects
// @route   GET /api/classes/:id
// @access  Private
export const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const classItem = await Class.findOne({ _id: id, isActive: true }).populate(
      'classTeacher',
      'firstName lastName email phone teacherId avatar'
    );

    if (!classItem) {
      return errorResponse(res, 'Class not found', 404);
    }

    const [students, subjects] = await Promise.all([
      Student.find({ classId: id, isActive: true }).sort({ rollNumber: 1, firstName: 1 }),
      Subject.find({ classId: id, isActive: true }).populate(
        'teacherId',
        'firstName lastName email teacherId'
      ),
    ]);

    return successResponse(res, 'Class details retrieved', {
      class: classItem,
      students,
      subjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new class
// @route   POST /api/classes
// @access  Private (Admin only)
export const createClass = async (req, res, next) => {
  try {
    const { name, grade, section, classTeacher, roomNumber, capacity, academicYear } = req.body;

    const newClass = await Class.create({
      name,
      grade,
      section: section.toUpperCase(),
      classTeacher: classTeacher || null,
      roomNumber,
      capacity: capacity || 40,
      academicYear: academicYear || '2025-2026',
    });

    const populated = await Class.findById(newClass._id).populate(
      'classTeacher',
      'firstName lastName email teacherId'
    );

    return successResponse(res, 'Class created successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin only)
export const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.section) {
      updates.section = updates.section.toUpperCase();
    }

    const updated = await Class.findOneAndUpdate(
      { _id: id, isActive: true },
      updates,
      { new: true, runValidators: true }
    ).populate('classTeacher', 'firstName lastName email teacherId');

    if (!updated) {
      return errorResponse(res, 'Class not found', 404);
    }

    return successResponse(res, 'Class updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete class (Soft Delete)
// @route   DELETE /api/classes/:id
// @access  Private (Admin only)
export const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;

    const classItem = await Class.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!classItem) {
      return errorResponse(res, 'Class not found', 404);
    }

    return successResponse(res, 'Class deleted successfully (soft delete)');
  } catch (error) {
    next(error);
  }
};
