import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
    },
    term: {
      type: String,
      required: [true, 'Exam term is required (e.g., Midterm, Final)'],
      trim: true,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
      trim: true,
    },
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: false,
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

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
