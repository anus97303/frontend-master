import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { generateId } from '../utils/idGenerator.js';

// @desc    Get all teachers with search & pagination
// @route   GET /api/teachers
// @access  Private
export const getTeachers = async (req, res, next) => {
  try {
    const { search, department, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { teacherId: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    if (department) {
      query.department = department;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [teachers, total] = await Promise.all([
      Teacher.find(query)
        .populate('assignedClasses', 'name grade section')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Teacher.countDocuments(query),
    ]);

    return successResponse(res, 'Teachers retrieved successfully', {
      teachers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single teacher details
// @route   GET /api/teachers/:id
// @access  Private
export const getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findOne({ _id: id, isActive: true }).populate(
      'assignedClasses',
      'name grade section roomNumber'
    );

    if (!teacher) {
      return errorResponse(res, 'Teacher not found', 404);
    }

    return successResponse(res, 'Teacher details retrieved', teacher);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private (Admin only)
export const createTeacher = async (req, res, next) => {
  try {
    const teacherData = req.body;

    // Parse subjects if sent as string (e.g. from FormData)
    if (typeof teacherData.subjects === 'string') {
      try {
        teacherData.subjects = JSON.parse(teacherData.subjects);
      } catch {
        teacherData.subjects = teacherData.subjects.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    // Parse assignedClasses if sent as JSON string
    if (typeof teacherData.assignedClasses === 'string') {
      try {
        teacherData.assignedClasses = JSON.parse(teacherData.assignedClasses);
      } catch {
        teacherData.assignedClasses = [teacherData.assignedClasses];
      }
    }

    // Generate Teacher ID
    const teacherId = await generateId(Teacher, 'teacherId', 'TCH');
    teacherData.teacherId = teacherId;

    if (req.file) {
      teacherData.avatar = `/uploads/${req.file.filename}`;
    }

    const teacher = await Teacher.create(teacherData);

    // Create a User account for the teacher
    if (teacher.email) {
      const existingUser = await User.findOne({ email: teacher.email });
      if (!existingUser) {
        await User.create({
          name: `${teacher.firstName} ${teacher.lastName}`,
          email: teacher.email,
          password: 'teacher123', // default initial password
          role: 'teacher',
          phone: teacher.phone || '',
          avatar: teacher.avatar || '',
          referenceId: teacher._id,
          referenceModel: 'Teacher',
        });
      }
    }

    const populated = await Teacher.findById(teacher._id).populate('assignedClasses', 'name grade section');
    return successResponse(res, 'Teacher created successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin only)
export const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (typeof updates.subjects === 'string') {
      try {
        updates.subjects = JSON.parse(updates.subjects);
      } catch {
        updates.subjects = updates.subjects.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    if (typeof updates.assignedClasses === 'string') {
      try {
        updates.assignedClasses = JSON.parse(updates.assignedClasses);
      } catch {
        updates.assignedClasses = [updates.assignedClasses];
      }
    }

    if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`;
    }

    delete updates.teacherId;

    const teacher = await Teacher.findOneAndUpdate(
      { _id: id, isActive: true },
      updates,
      { new: true, runValidators: true }
    ).populate('assignedClasses', 'name grade section');

    if (!teacher) {
      return errorResponse(res, 'Teacher not found', 404);
    }

    return successResponse(res, 'Teacher updated successfully', teacher);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher (Soft Delete)
// @route   DELETE /api/teachers/:id
// @access  Private (Admin only)
export const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!teacher) {
      return errorResponse(res, 'Teacher not found', 404);
    }

    // Also deactivate associated User account
    await User.findOneAndUpdate({ referenceId: id }, { isActive: false });

    return successResponse(res, 'Teacher removed successfully (soft delete)');
  } catch (error) {
    next(error);
  }
};
