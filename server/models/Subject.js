import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      trim: true,
      uppercase: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Assigned class is required'],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    type: {
      type: String,
      enum: ['Core', 'Elective', 'Practical', 'Language'],
      default: 'Core',
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

subjectSchema.index({ code: 1, classId: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
