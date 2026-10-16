import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: String,
      required: [true, 'Teacher ID is required'],
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
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    dob: {
      type: Date,
      default: null,
    },
    qualification: {
      type: String,
      trim: true,
      default: 'Bachelor of Education',
    },
    designation: {
      type: String,
      trim: true,
      default: 'Subject Teacher',
    },
    department: {
      type: String,
      trim: true,
      default: 'General',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 0,
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
    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    subjects: [
      {
        type: String,
        trim: true,
      },
    ],
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

teacherSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
