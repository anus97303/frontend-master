import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Leave'],
      default: 'Present',
      required: [true, 'Attendance status is required'],
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Attendance ek din mein ek student ki ek hi entry (unique: student+date)
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });
attendanceSchema.index({ class: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
