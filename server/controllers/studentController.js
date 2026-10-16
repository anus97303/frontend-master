import Student from '../models/Student.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Result from '../models/Result.js';
import Fee from '../models/Fee.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { generateId } from '../utils/idGenerator.js';

// @desc    Get all students with search, filter, sort & pagination
// @route   GET /api/students
// @access  Private (Admin, Teacher, Student/Parent view themselves)
export const getStudents = async (req, res, next) => {
  try {
    const {
      search,
      classId,
      section,
      gender,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = { isActive: true };

    // Role-based scoping: student can only query their own
    if (req.user.role === 'student' && req.user.referenceId) {
      query._id = req.user.referenceId;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { studentId: searchRegex },
        { rollNumber: searchRegex },
        { guardianName: searchRegex },
      ];
    }

    if (classId) query.classId = classId;
    if (section) query.section = section;
    if (gender) query.gender = gender;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('classId', 'name grade section')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Student.countDocuments(query),
    ]);

    return successResponse(res, 'Students retrieved successfully', {
      students,
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

// @desc    Get single student details with complete profile, attendance %, results & fees
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Security: Student can only view their own profile
    if (req.user.role === 'student' && req.user.referenceId?.toString() !== id) {
      return errorResponse(res, 'Access denied. You can only view your own profile.', 403);
    }

    const student = await Student.findOne({ _id: id, isActive: true }).populate(
      'classId',
      'name grade section roomNumber academicYear'
    );

    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }

    // 1. Attendance statistics
    const totalAttendance = await Attendance.countDocuments({ student: student._id });
    const presentCount = await Attendance.countDocuments({ student: student._id, status: 'Present' });
    const absentCount = await Attendance.countDocuments({ student: student._id, status: 'Absent' });
    const lateCount = await Attendance.countDocuments({ student: student._id, status: 'Late' });
    const leaveCount = await Attendance.countDocuments({ student: student._id, status: 'Leave' });

    const attendanceRate = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : '100.0';

    const recentAttendance = await Attendance.find({ student: student._id })
      .sort({ date: -1 })
      .limit(10);

    // 2. Exam results
    const results = await Result.find({ studentId: student._id })
      .populate('examId', 'title term academicYear')
      .sort({ createdAt: -1 });

    // 3. Fee records
    const fees = await Fee.find({ studentId: student._id }).sort({ createdAt: -1 });
    const feeSummary = fees.reduce(
      (acc, item) => {
        if (item.status !== 'Cancelled') {
          acc.totalBilled += item.amount;
          acc.totalPaid += item.paidAmount;
          acc.totalBalance += item.balance;
        }
        return acc;
      },
      { totalBilled: 0, totalPaid: 0, totalBalance: 0 }
    );

    return successResponse(res, 'Student profile retrieved', {
      student,
      attendanceStats: {
        total: totalAttendance,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        leave: leaveCount,
        rate: attendanceRate,
        recent: recentAttendance,
      },
      results,
      fees,
      feeSummary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin only)
export const createStudent = async (req, res, next) => {
  try {
    const studentData = req.body;

    // Auto-generate student ID
    const studentId = await generateId(Student, 'studentId', 'STU');
    studentData.studentId = studentId;

    if (req.file) {
      studentData.avatar = `/uploads/${req.file.filename}`;
    }

    const student = await Student.create(studentData);

    // Automatically create a user login account for the student if email provided
    if (student.email) {
      const existingUser = await User.findOne({ email: student.email });
      if (!existingUser) {
        await User.create({
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          password: 'student123', // default initial password
          role: 'student',
          phone: student.guardianPhone || '',
          avatar: student.avatar || '',
          referenceId: student._id,
          referenceModel: 'Student',
        });
      }
    }

    const populated = await Student.findById(student._id).populate('classId', 'name grade section');
    return successResponse(res, 'Student registered successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin only)
export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`;
    }

    // Do not allow overwriting studentId
    delete updates.studentId;

    const student = await Student.findOneAndUpdate(
      { _id: id, isActive: true },
      updates,
      { new: true, runValidators: true }
    ).populate('classId', 'name grade section');

    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }

    return successResponse(res, 'Student updated successfully', student);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student (Soft Delete)
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await Student.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }

    // Also deactivate associated User account
    await User.findOneAndUpdate({ referenceId: id }, { isActive: false });

    return successResponse(res, 'Student removed successfully (soft delete)');
  } catch (error) {
    next(error);
  }
};
