import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema(
  {
    receiptNo: {
      type: String,
      required: [true, 'Receipt number is required'],
      unique: true,
      trim: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    title: {
      type: String,
      required: [true, 'Fee title/description is required'],
      trim: true,
    },
    feeType: {
      type: String,
      enum: ['Tuition', 'Admission', 'Exam', 'Transport', 'Library', 'Other'],
      default: 'Tuition',
    },
    amount: {
      type: Number,
      required: [true, 'Fee total amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    balance: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: Date,
      default: Date.now,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Online', 'Cheque', 'Card'],
      default: 'Cash',
    },
    status: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending', 'Cancelled'],
      default: 'Pending',
    },
    cancelReason: {
      type: String,
      trim: true,
      default: '',
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

feeSchema.index({ studentId: 1, status: 1 });

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;
