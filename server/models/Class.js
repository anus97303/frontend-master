import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide class name (e.g., Grade 9)'],
      trim: true,
    },
    grade: {
      type: String,
      required: [true, 'Please specify grade/standard'],
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Please specify section (e.g., A, B)'],
      trim: true,
      uppercase: true,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    roomNumber: {
      type: String,
      trim: true,
      default: '',
    },
    capacity: {
      type: Number,
      default: 40,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

classSchema.index({ grade: 1, section: 1, academicYear: 1 }, { unique: true });

const Class = mongoose.model('Class', classSchema);
export default Class;
