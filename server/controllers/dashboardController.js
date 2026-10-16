import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Class from '../models/Class.js';
import Fee from '../models/Fee.js';
import Attendance from '../models/Attendance.js';
import Exam from '../models/Exam.js';
import Notice from '../models/Notice.js';
import { successResponse } from '../utils/response.js';

// @desc    Get dashboard statistics & overview
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;

    // 1. Core Counts
    const [totalStudents, totalTeachers, totalClasses] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Teacher.countDocuments({ isActive: true }),
      Class.countDocuments({ isActive: true }),
    ]);

    // 2. Fee Stats
    const feeAggregate = await Fee.aggregate([
      {
        $match: { status: { $ne: 'Cancelled' } },
      },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$paidAmount' },
          totalPending: { $sum: '$balance' },
          totalBilled: { $sum: '$amount' },
        },
      },
    ]);

    const feeStats = feeAggregate[0] || {
      totalCollected: 0,
      totalPending: 0,
      totalBilled: 0,
    };

    // 3. Attendance Overview (Last 7 active days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 14);

    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    // Process attendance into timeline
    const attendanceByDate = {};
    attendanceStats.forEach((item) => {
      const d = item._id.date;
      if (!attendanceByDate[d]) {
        attendanceByDate[d] = { date: d, Present: 0, Absent: 0, Late: 0, Leave: 0 };
      }
      attendanceByDate[d][item._id.status] = item.count;
    });

    const attendanceTimeline = Object.values(attendanceByDate).slice(-7);

    // 4. Recent Admissions
    const recentStudents = await Student.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('classId', 'name grade section')
      .select('studentId firstName lastName classId admissionDate avatar gender');

    // 5. Upcoming Exams
    const upcomingExams = await Exam.find({
      isActive: true,
      endDate: { $gte: new Date() },
    })
      .sort({ startDate: 1 })
      .limit(4);

    // 6. Role-filtered Notices
    const noticeQuery = { isActive: true };
    if (role !== 'admin') {
      noticeQuery.$or = [{ targetRole: 'all' }, { targetRole: role }];
    }
    const recentNotices = await Notice.find(noticeQuery)
      .sort({ date: -1 })
      .limit(5);

    // 7. Student specific stats (if student role)
    let studentSpecific = null;
    if (role === 'student' && req.user.referenceId) {
      const myStudent = await Student.findById(req.user.referenceId).populate('classId');
      const myAttendanceCount = await Attendance.countDocuments({ student: req.user.referenceId });
      const myPresentCount = await Attendance.countDocuments({
        student: req.user.referenceId,
        status: 'Present',
      });
      const myFeePending = await Fee.aggregate([
        { $match: { studentId: req.user.referenceId, status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, balance: { $sum: '$balance' } } },
      ]);

      studentSpecific = {
        student: myStudent,
        attendancePercentage: myAttendanceCount > 0 ? ((myPresentCount / myAttendanceCount) * 100).toFixed(1) : 100,
        pendingFees: myFeePending[0]?.balance || 0,
      };
    }

    return successResponse(res, 'Dashboard statistics retrieved', {
      totals: {
        students: totalStudents,
        teachers: totalTeachers,
        classes: totalClasses,
        feeCollected: feeStats.totalCollected,
        feePending: feeStats.totalPending,
      },
      attendanceTimeline,
      recentStudents,
      upcomingExams,
      recentNotices,
      studentSpecific,
    });
  } catch (error) {
    next(error);
  }
};
