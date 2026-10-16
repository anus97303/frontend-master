import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import Teacher from '../models/Teacher.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { calculateGrade } from '../utils/gradeCalculator.js';

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
export const getExams = async (req, res, next) => {
  try {
    const { academicYear, term } = req.query;
    const query = { isActive: true };
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;

    const exams = await Exam.find(query)
      .populate('classes', 'name grade section')
      .sort({ startDate: -1 });

    return successResponse(res, 'Exams retrieved successfully', exams);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private (Admin only)
export const createExam = async (req, res, next) => {
  try {
    const exam = await Exam.create(req.body);
    const populated = await Exam.findById(exam._id).populate('classes', 'name grade section');
    return successResponse(res, 'Exam created successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Admin only)
export const updateExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Exam.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('classes', 'name grade section');

    if (!updated) {
      return errorResponse(res, 'Exam not found', 404);
    }

    return successResponse(res, 'Exam updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete exam (Soft delete)
// @route   DELETE /api/exams/:id
// @access  Private (Admin only)
export const deleteExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!exam) {
      return errorResponse(res, 'Exam not found', 404);
    }
    return successResponse(res, 'Exam deleted successfully (soft delete)');
  } catch (error) {
    next(error);
  }
};

// @desc    Save or update marks for a student in an exam
// @route   POST /api/results
// @access  Private (Teacher, Admin)
export const saveResult = async (req, res, next) => {
  try {
    const { examId, studentId, classId, marks, remarks } = req.body;

    if (!examId || !studentId || !classId || !Array.isArray(marks)) {
      return errorResponse(res, 'examId, studentId, classId and marks array are required', 400);
    }

    // Role check for teacher
    if (req.user.role === 'teacher' && req.user.referenceId) {
      const teacher = await Teacher.findById(req.user.referenceId);
      const isAssigned = teacher?.assignedClasses?.some((c) => c.toString() === classId);
      if (!isAssigned) {
        return errorResponse(res, 'You are not assigned to record marks for this class', 403);
      }
    }

    // Process marks, compute subject-wise grade, totals and percentage
    let totalMarksObtained = 0;
    let totalMarksMax = 0;

    const computedMarks = marks.map((item) => {
      const marksObtained = Math.max(0, Number(item.marksObtained) || 0);
      const totalMarks = Math.max(1, Number(item.totalMarks) || 100);

      // Business rule: marks 0 se total marks ke darmiyan
      const cappedObtained = Math.min(marksObtained, totalMarks);
      const subjectPct = (cappedObtained / totalMarks) * 100;
      const { grade } = calculateGrade(subjectPct);

      totalMarksObtained += cappedObtained;
      totalMarksMax += totalMarks;

      return {
        subjectId: item.subjectId,
        subjectName: item.subjectName,
        marksObtained: cappedObtained,
        totalMarks,
        grade,
      };
    });

    const percentage =
      totalMarksMax > 0 ? Number(((totalMarksObtained / totalMarksMax) * 100).toFixed(2)) : 0;
    const { grade: overallGrade } = calculateGrade(percentage);

    const result = await Result.findOneAndUpdate(
      { examId, studentId },
      {
        examId,
        studentId,
        classId,
        marks: computedMarks,
        totalMarksObtained,
        totalMarksMax,
        percentage,
        overallGrade,
        remarks: remarks || '',
        teacherId: req.user.role === 'teacher' ? req.user.referenceId : null,
      },
      { upsert: true, new: true, runValidators: true }
    )
      .populate('studentId', 'studentId firstName lastName rollNumber avatar')
      .populate('examId', 'title term academicYear')
      .populate('classId', 'name grade section');

    return successResponse(res, 'Marks & results saved successfully', result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get results for a student (report card)
// @route   GET /api/results/student/:id
// @access  Private
export const getStudentResults = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Student security check
    if (req.user.role === 'student' && req.user.referenceId?.toString() !== id) {
      return errorResponse(res, 'Access denied. You can only view your own results.', 403);
    }

    const results = await Result.find({ studentId: id })
      .populate('examId', 'title term academicYear startDate endDate')
      .populate('classId', 'name grade section')
      .sort({ createdAt: -1 });

    const student = await Student.findById(id).populate('classId', 'name grade section');

    return successResponse(res, 'Student results retrieved', {
      student,
      results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get results for an entire class in an exam
// @route   GET /api/results/class
// @access  Private
export const getClassExamResults = async (req, res, next) => {
  try {
    const { examId, classId } = req.query;

    if (!examId || !classId) {
      return errorResponse(res, 'examId and classId are required', 400);
    }

    const students = await Student.find({ classId, isActive: true })
      .sort({ rollNumber: 1, firstName: 1 })
      .select('studentId firstName lastName rollNumber avatar');

    const subjects = await Subject.find({ classId, isActive: true }).select('name code');

    const existingResults = await Result.find({ examId, classId });
    const resultMap = new Map();
    existingResults.forEach((r) => resultMap.set(r.studentId.toString(), r));

    const sheet = students.map((stu) => {
      const resData = resultMap.get(stu._id.toString());
      return {
        student: stu,
        result: resData || null,
        isRecorded: !!resData,
      };
    });

    return successResponse(res, 'Class exam results retrieved', {
      students: sheet,
      subjects,
    });
  } catch (error) {
    next(error);
  }
};
