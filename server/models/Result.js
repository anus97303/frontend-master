import mongoose from 'mongoose';

const subjectMarkSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: [0, 'Marks cannot be less than 0'],
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    grade: {
      type: String,
      default: 'F',
    },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam is required'],
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
    marks: [subjectMarkSchema],
    totalMarksObtained: {
      type: Number,
      default: 0,
    },
    totalMarksMax: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    overallGrade: {
      type: String,
      default: 'F',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

resultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

const Result = mongoose.model('Result', resultSchema);
export default Result;
