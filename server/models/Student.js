import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class assignment is required'],
    },
    section: {
      type: String,
      trim: true,
      default: 'A',
    },
    rollNumber: {
      type: String,
      trim: true,
      default: '',
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
      trim: true,
    },
    guardianName: {
      type: String,
      required: [true, 'Guardian name is required'],
      trim: true,
    },
    guardianRelation: {
      type: String,
      default: 'Parent',
      trim: true,
    },
    guardianPhone: {
      type: String,
      required: [true, 'Guardian phone is required'],
      trim: true,
    },
    guardianEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    guardianOccupation: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

studentSchema.index({ classId: 1, rollNumber: 1 });

const Student = mongoose.model('Student', studentSchema);
export default Student;
