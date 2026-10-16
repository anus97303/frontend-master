import Fee from '../models/Fee.js';
import Student from '../models/Student.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { generateId } from '../utils/idGenerator.js';

// @desc    Get all fees with filtering & pagination
// @route   GET /api/fees
// @access  Private
export const getFees = async (req, res, next) => {
  try {
    const { status, studentId, classId, page = 1, limit = 20 } = req.query;

    const query = {};

    // Security: Student can only view their own fees
    if (req.user.role === 'student' && req.user.referenceId) {
      query.studentId = req.user.referenceId;
    } else if (studentId) {
      query.studentId = studentId;
    }

    if (status) query.status = status;
    if (classId) query.classId = classId;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [fees, total] = await Promise.all([
      Fee.find(query)
        .populate('studentId', 'studentId firstName lastName rollNumber avatar')
        .populate('classId', 'name grade section')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Fee.countDocuments(query),
    ]);

    return successResponse(res, 'Fees retrieved successfully', {
      fees,
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

// @desc    Record fee payment
// @route   POST /api/fees/pay
// @access  Private (Admin only)
export const recordFeePayment = async (req, res, next) => {
  try {
    const {
      studentId,
      classId,
      title,
      feeType,
      amount,
      discount = 0,
      paidAmount,
      paymentMethod,
      dueDate,
      remarks,
    } = req.body;

    const totalAmount = Number(amount) || 0;
    const discountAmount = Number(discount) || 0;
    const actualPayable = Math.max(0, totalAmount - discountAmount);
    const receivedAmount = Number(paidAmount) || 0;
    const balance = Math.max(0, actualPayable - receivedAmount);

    let status = 'Pending';
    if (receivedAmount >= actualPayable && actualPayable > 0) {
      status = 'Paid';
    } else if (receivedAmount > 0) {
      status = 'Partial';
    }

    // Auto-generate Receipt No
    const receiptNo = await generateId(Fee, 'receiptNo', 'REC');

    const fee = await Fee.create({
      receiptNo,
      studentId,
      classId,
      title,
      feeType: feeType || 'Tuition',
      amount: totalAmount,
      discount: discountAmount,
      paidAmount: receivedAmount,
      balance,
      dueDate: dueDate || new Date(),
      paymentDate: new Date(),
      paymentMethod: paymentMethod || 'Cash',
      status,
      remarks: remarks || '',
    });

    const populated = await Fee.findById(fee._id)
      .populate('studentId', 'studentId firstName lastName rollNumber guardianName guardianPhone')
      .populate('classId', 'name grade section');

    return successResponse(res, 'Payment recorded successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single receipt details
// @route   GET /api/fees/receipt/:id
// @access  Private
export const getReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;

    const fee = await Fee.findById(id)
      .populate('studentId', 'studentId firstName lastName rollNumber guardianName guardianPhone address')
      .populate('classId', 'name grade section')
      .populate('cancelledBy', 'name email');

    if (!fee) {
      return errorResponse(res, 'Receipt not found', 404);
    }

    // Student security check
    if (
      req.user.role === 'student' &&
      req.user.referenceId?.toString() !== fee.studentId?._id?.toString()
    ) {
      return errorResponse(res, 'Access denied to this receipt', 403);
    }

    return successResponse(res, 'Receipt retrieved successfully', fee);
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending fee summary and list
// @route   GET /api/fees/pending
// @access  Private (Admin only)
export const getPendingFees = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const query = {
      status: { $in: ['Pending', 'Partial'] },
    };
    if (classId) query.classId = classId;

    const pendingFees = await Fee.find(query)
      .populate('studentId', 'studentId firstName lastName rollNumber guardianName guardianPhone')
      .populate('classId', 'name grade section')
      .sort({ dueDate: 1 });

    const totalPendingAmount = pendingFees.reduce((acc, curr) => acc + curr.balance, 0);

    return successResponse(res, 'Pending fees retrieved', {
      totalPendingAmount,
      count: pendingFees.length,
      pendingFees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel fee record (Audit trail - NOT hard deleted)
// @route   PUT /api/fees/cancel/:id
// @access  Private (Admin only)
export const cancelFeePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const fee = await Fee.findById(id);
    if (!fee) {
      return errorResponse(res, 'Fee record not found', 404);
    }

    if (fee.status === 'Cancelled') {
      return errorResponse(res, 'Fee record is already cancelled', 400);
    }

    fee.status = 'Cancelled';
    fee.cancelReason = cancelReason || 'Cancelled by Administrator';
    fee.cancelledBy = req.user._id;
    fee.cancelledAt = new Date();

    await fee.save();

    const populated = await Fee.findById(fee._id)
      .populate('studentId', 'studentId firstName lastName')
      .populate('cancelledBy', 'name');

    return successResponse(res, 'Fee record successfully cancelled (audit preserved)', populated);
  } catch (error) {
    next(error);
  }
};
