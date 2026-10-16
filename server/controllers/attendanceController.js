import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Normalizes a date to start of day UTC
const normalizeDate = (d) => {
  const dateObj = new Date(d);
  dateObj.setUTCHours(0, 0, 0, 0);
  return dateObj;
};

// @desc    Get attendance for a specific class and date
// @route   GET /api/attendance
// @access  Private
export const getClassAttendance = async (req, res, next) => {
  try {
    const { classId, date } = req.query;

    if (!classId || !date) {
      return errorResponse(res, 'Please provide both classId and date', 400);
    }

    const targetDate = normalizeDate(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Get all students of this class
    const students = await Student.find({ classId, isActive: true })
      .sort({ rollNumber: 1, firstName: 1 })
      .select('studentId firstName lastName rollNumber avatar gender');

    // Get existing attendance entries for this date
    const existingRecords = await Attendance.find({
      class: classId,
      date: {
        $gte: targetDate,
        $lt: nextDate,
      },
    });

    const recordMap = new Map();
    existingRecords.forEach((rec) => {
      recordMap.set(rec.student.toString(), rec);
    });

    // Merge student list with their attendance status
    const attendanceSheet = students.map((stu) => {
      const rec = recordMap.get(stu._id.toString());
      return {
        student: stu,
        attendanceId: rec?._id || null,
        status: rec?.status || 'Present', // default to Present if not marked yet
        remarks: rec?.remarks || '',
        isMarked: !!rec,
      };
    });

    return successResponse(res, 'Class attendance retrieved', {
      date: targetDate,
      classId,
      records: attendanceSheet,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk mark or update daily attendance
// @route   POST /api/attendance
// @access  Private (Teacher, Admin)
export const markAttendance = async (req, res, next) => {
  try {
    const { classId, date, records } = req.body;

    if (!classId || !date || !Array.isArray(records)) {
      return errorResponse(res, 'classId, date, and records array are required', 400);
    }

    // Role check: if teacher, verify teacher is assigned to this class
    if (req.user.role === 'teacher' && req.user.referenceId) {
      const teacher = await Teacher.findById(req.user.referenceId);
      const isAssigned = teacher?.assignedClasses?.some((c) => c.toString() === classId);
      if (!isAssigned) {
        return errorResponse(res, 'You are not assigned to mark attendance for this class', 403);
      }
    }

    const targetDate = normalizeDate(date);

    // Upsert each record
    const operations = records.map((item) => ({
      updateOne: {
        filter: {
          student: item.studentId,
          date: targetDate,
        },
        update: {
          $set: {
            class: classId,
            date: targetDate,
            status: item.status || 'Present',
            remarks: item.remarks || '',
            markedBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await Attendance.bulkWrite(operations);
    }

    return successResponse(res, 'Attendance saved successfully', {
      totalMarked: records.length,
      date: targetDate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly/annual attendance report for a student
// @route   GET /api/attendance/report/:studentId
// @access  Private
export const getStudentAttendanceReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;

    // Security: Student can only view their own report
    if (req.user.role === 'student' && req.user.referenceId?.toString() !== studentId) {
      return errorResponse(res, 'Access denied. You can only view your own report.', 403);
    }

    const query = { student: studentId };

    if (year) {
      const start = new Date(parseInt(year, 10), month ? parseInt(month, 10) - 1 : 0, 1);
      const end = month
        ? new Date(parseInt(year, 10), parseInt(month, 10), 0, 23, 59, 59)
        : new Date(parseInt(year, 10), 11, 31, 23, 59, 59);

      query.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(query).sort({ date: 1 });

    const summary = records.reduce(
      (acc, r) => {
        acc.totalDays += 1;
        if (r.status === 'Present') acc.present += 1;
        else if (r.status === 'Absent') acc.absent += 1;
        else if (r.status === 'Late') acc.late += 1;
        else if (r.status === 'Leave') acc.leave += 1;
        return acc;
      },
      { totalDays: 0, present: 0, absent: 0, late: 0, leave: 0 }
    );

    const percentage =
      summary.totalDays > 0 ? ((summary.present / summary.totalDays) * 100).toFixed(1) : '100.0';

    return successResponse(res, 'Attendance report generated', {
      summary: {
        ...summary,
        percentage,
      },
      records,
    });
  } catch (error) {
    next(error);
  }
};
