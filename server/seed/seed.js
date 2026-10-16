import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import Fee from '../models/Fee.js';
import Notice from '../models/Notice.js';
import SchoolSettings from '../models/SchoolSettings.js';
import { calculateGrade } from '../utils/gradeCalculator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Teacher.deleteMany({}),
      Class.deleteMany({}),
      Subject.deleteMany({}),
      Attendance.deleteMany({}),
      Exam.deleteMany({}),
      Result.deleteMany({}),
      Fee.deleteMany({}),
      Notice.deleteMany({}),
      SchoolSettings.deleteMany({}),
    ]);

    console.log('[Seed] 1. Creating School Settings...');
    await SchoolSettings.create({
      schoolName: 'Horizon International Academy',
      tagline: 'Excellence in Academics & Character Building',
      schoolEmail: 'info@horizonacademy.edu',
      schoolPhone: '+1 (555) 345-6789',
      address: '100 Knowledge Avenue, Silicon Valley, CA 94025',
      principalName: 'Dr. Elizabeth Warren',
      currentAcademicYear: '2025-2026',
      currencySymbol: '$',
      website: 'https://horizonacademy.edu',
      establishedYear: 2005,
    });

    console.log('[Seed] 2. Creating Admin User...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@school.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 000-0001',
    });

    console.log('[Seed] 3. Creating 3 Teachers & Accounts...');
    const teacherDefs = [
      {
        teacherId: 'TCH-2026-0001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@school.com',
        phone: '+1 (555) 100-0001',
        gender: 'Female',
        qualification: 'M.Sc. Mathematics, B.Ed.',
        designation: 'Senior Math Teacher',
        department: 'Mathematics',
        salary: 58000,
        subjects: ['Mathematics', 'Statistics'],
      },
      {
        teacherId: 'TCH-2026-0002',
        firstName: 'David',
        lastName: 'Smith',
        email: 'david.smith@school.com',
        phone: '+1 (555) 100-0002',
        gender: 'Male',
        qualification: 'M.Sc. Physics',
        designation: 'Science Coordinator',
        department: 'Science',
        salary: 61000,
        subjects: ['Physics', 'General Science'],
      },
      {
        teacherId: 'TCH-2026-0003',
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@school.com',
        phone: '+1 (555) 100-0003',
        gender: 'Female',
        qualification: 'M.A. English Literature',
        designation: 'English Faculty Lead',
        department: 'Humanities',
        salary: 55000,
        subjects: ['English Language', 'Literature'],
      },
    ];

    const teachers = [];
    for (const tDef of teacherDefs) {
      const teacher = await Teacher.create(tDef);
      const user = await User.create({
        name: `${teacher.firstName} ${teacher.lastName}`,
        email: teacher.email,
        password: 'teacher123',
        role: 'teacher',
        phone: teacher.phone,
        referenceId: teacher._id,
        referenceModel: 'Teacher',
      });
      teacher.userId = user._id;
      await teacher.save();
      teachers.push(teacher);
    }

    console.log('[Seed] 4. Creating Classes...');
    const classA9 = await Class.create({
      name: 'Grade 9 - A',
      grade: '9',
      section: 'A',
      classTeacher: teachers[0]._id,
      roomNumber: 'Room 101',
      capacity: 35,
      academicYear: '2025-2026',
    });

    const classB9 = await Class.create({
      name: 'Grade 9 - B',
      grade: '9',
      section: 'B',
      classTeacher: teachers[1]._id,
      roomNumber: 'Room 102',
      capacity: 35,
      academicYear: '2025-2026',
    });

    const classA10 = await Class.create({
      name: 'Grade 10 - A',
      grade: '10',
      section: 'A',
      classTeacher: teachers[2]._id,
      roomNumber: 'Room 201',
      capacity: 35,
      academicYear: '2025-2026',
    });

    const classB10 = await Class.create({
      name: 'Grade 10 - B',
      grade: '10',
      section: 'B',
      roomNumber: 'Room 202',
      capacity: 35,
      academicYear: '2025-2026',
    });

    // Link assigned classes back to teachers
    teachers[0].assignedClasses.push(classA9._id);
    await teachers[0].save();
    teachers[1].assignedClasses.push(classB9._id);
    await teachers[1].save();
    teachers[2].assignedClasses.push(classA10._id);
    await teachers[2].save();

    console.log('[Seed] 5. Creating Subjects...');
    const subjectsList = [
      { name: 'Mathematics', code: 'MTH-901', classId: classA9._id, teacherId: teachers[0]._id, type: 'Core' },
      { name: 'General Science', code: 'SCI-901', classId: classA9._id, teacherId: teachers[1]._id, type: 'Core' },
      { name: 'English Language', code: 'ENG-901', classId: classA9._id, teacherId: teachers[2]._id, type: 'Core' },
      { name: 'Computer Science', code: 'CS-901', classId: classA9._id, teacherId: teachers[0]._id, type: 'Elective' },
      { name: 'Social Studies', code: 'SOC-901', classId: classA9._id, type: 'Core' },
      { name: 'Advanced Mathematics', code: 'MTH-101', classId: classA10._id, teacherId: teachers[0]._id, type: 'Core' },
      { name: 'Physics', code: 'PHY-101', classId: classA10._id, teacherId: teachers[1]._id, type: 'Core' },
      { name: 'English Literature', code: 'ENG-101', classId: classA10._id, teacherId: teachers[2]._id, type: 'Core' },
    ];
    const createdSubjects = await Subject.insertMany(subjectsList);

    console.log('[Seed] 6. Creating 20 Students...');
    const firstNames = [
      'Alexander', 'Emma', 'Liam', 'Olivia', 'Noah',
      'Ava', 'Ethan', 'Sophia', 'Lucas', 'Isabella',
      'Mason', 'Mia', 'Oliver', 'Charlotte', 'Elijah',
      'Amelia', 'James', 'Harper', 'Benjamin', 'Evelyn'
    ];
    const lastNames = [
      'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor',
      'Anderson', 'Thomas', 'Jackson', 'White', 'Harris',
      'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson',
      'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker'
    ];

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'O+', 'O-'];
    const students = [];

    for (let i = 0; i < 20; i++) {
      const isFemale = i % 2 === 1;
      const firstName = firstNames[i];
      const lastName = lastNames[i];
      const studentIdNum = String(i + 1).padStart(4, '0');
      const studentId = `STU-2026-${studentIdNum}`;
      const rollNumber = String((i % 10) + 1);

      // Distribute classes: 0..9 in Grade 9-A, 10..14 in Grade 9-B, 15..19 in Grade 10-A
      let assignedClass = classA9;
      if (i >= 10 && i < 15) assignedClass = classB9;
      if (i >= 15) assignedClass = classA10;

      const studentEmail = `student${i + 1}@school.com`;
      const birthYear = assignedClass.grade === '10' ? 2010 : 2011;

      const student = await Student.create({
        studentId,
        firstName,
        lastName,
        email: studentEmail,
        gender: isFemale ? 'Female' : 'Male',
        dob: new Date(birthYear, (i * 2) % 12, (i * 3 + 1) % 28 + 1),
        bloodGroup: bloodGroups[i % bloodGroups.length],
        classId: assignedClass._id,
        section: assignedClass.section,
        rollNumber,
        admissionDate: new Date(2025, 7, 15),
        guardianName: `Robert ${lastName}`,
        guardianRelation: 'Father',
        guardianPhone: `+1 (555) 200-${String(i + 1).padStart(4, '0')}`,
        guardianEmail: `guardian.${lastName.toLowerCase()}@example.com`,
        guardianOccupation: 'Professional',
        address: `${100 + i} Elm Street, Springfield`,
      });

      // Create student user account
      const user = await User.create({
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        password: 'student123',
        role: 'student',
        phone: student.guardianPhone,
        referenceId: student._id,
        referenceModel: 'Student',
      });

      student.userId = user._id;
      await student.save();
      students.push(student);
    }

    console.log('[Seed] 7. Generating 30 Days of Daily Attendance...');
    const attendanceStatuses = ['Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Late', 'Absent', 'Leave'];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const attendanceRecords = [];
    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const attDate = new Date(today);
      attDate.setDate(today.getDate() - dayOffset);

      // Skip weekends (0: Sunday, 6: Saturday)
      if (attDate.getDay() === 0 || attDate.getDay() === 6) continue;

      for (const stu of students) {
        // Pseudo-random deterministic status
        const randIndex = (stu.studentId.charCodeAt(10) + dayOffset) % attendanceStatuses.length;
        attendanceRecords.push({
          student: stu._id,
          class: stu.classId,
          date: attDate,
          status: attendanceStatuses[randIndex],
          remarks: attendanceStatuses[randIndex] === 'Late' ? 'Arrived 10 mins late' : '',
          markedBy: teachers[0]._id,
        });
      }
    }
    await Attendance.insertMany(attendanceRecords);

    console.log('[Seed] 8. Creating Exams & Student Results...');
    const midtermExam = await Exam.create({
      title: 'Midterm Examination 2026',
      term: 'Term 1',
      academicYear: '2025-2026',
      classes: [classA9._id, classB9._id, classA10._id],
      startDate: new Date(2026, 2, 10),
      endDate: new Date(2026, 2, 25),
      description: 'Comprehensive Term 1 evaluation for Core and Elective subjects.',
      isPublished: true,
    });

    // Generate results for students of Grade 9 - A
    const classA9Students = students.filter((s) => s.classId.toString() === classA9._id.toString());
    const classA9Subjects = createdSubjects.filter((sub) => sub.classId.toString() === classA9._id.toString());

    for (let idx = 0; idx < classA9Students.length; idx++) {
      const stu = classA9Students[idx];
      let totalObtained = 0;
      let totalMax = 0;

      const marks = classA9Subjects.map((sub, sIdx) => {
        // Base score between 65 and 96
        const baseScore = 70 + ((idx * 7 + sIdx * 5) % 27);
        const cappedScore = Math.min(100, Math.max(50, baseScore));
        const { grade } = calculateGrade(cappedScore);
        totalObtained += cappedScore;
        totalMax += 100;

        return {
          subjectId: sub._id,
          subjectName: sub.name,
          marksObtained: cappedScore,
          totalMarks: 100,
          grade,
        };
      });

      const percentage = Number(((totalObtained / totalMax) * 100).toFixed(2));
      const { grade: overallGrade } = calculateGrade(percentage);

      await Result.create({
        examId: midtermExam._id,
        studentId: stu._id,
        classId: classA9._id,
        marks,
        totalMarksObtained: totalObtained,
        totalMarksMax: totalMax,
        percentage,
        overallGrade,
        remarks: percentage >= 80 ? 'Outstanding academic performance' : 'Good effort, keep improving',
        teacherId: teachers[0]._id,
        isPublished: true,
      });
    }

    console.log('[Seed] 9. Generating Fee Payments & Receipts...');
    const feeTitles = ['Term 1 Tuition Fee', 'Laboratory & Science Fee', 'Annual Library Fee'];
    for (let i = 0; i < students.length; i++) {
      const stu = students[i];
      const receiptNo = `REC-2026-${String(i + 1).padStart(4, '0')}`;
      const feeAmount = 1200;
      const discount = i % 5 === 0 ? 200 : 0;
      const payable = feeAmount - discount;

      // Status distribution: mostly Paid, some Partial, some Pending
      let paidAmount = payable;
      let status = 'Paid';
      if (i % 4 === 1) {
        paidAmount = Math.floor(payable / 2);
        status = 'Partial';
      } else if (i % 6 === 2) {
        paidAmount = 0;
        status = 'Pending';
      }

      const balance = payable - paidAmount;

      await Fee.create({
        receiptNo,
        studentId: stu._id,
        classId: stu.classId,
        title: feeTitles[i % feeTitles.length],
        feeType: i % 2 === 0 ? 'Tuition' : 'Exam',
        amount: feeAmount,
        discount,
        paidAmount,
        balance,
        dueDate: new Date(2026, 3, 30),
        paymentDate: paidAmount > 0 ? new Date(2026, 2, (i % 20) + 1) : null,
        paymentMethod: ['Cash', 'Bank Transfer', 'Online', 'Card'][i % 4],
        status,
        remarks: status === 'Paid' ? 'Full fee received on time' : 'First installment processed',
      });
    }

    console.log('[Seed] 10. Creating School Notices...');
    await Notice.insertMany([
      {
        title: 'Midterm Examination Schedule Released',
        content:
          'The timetable and room allocations for Midterm Examination 2026 are published. All students must report to their assigned exam halls by 8:30 AM with valid student ID cards.',
        targetRole: 'all',
        priority: 'high',
        author: adminUser._id,
        date: new Date(2026, 2, 5),
      },
      {
        title: 'Mandatory Faculty Curriculum Meeting',
        content:
          'All teachers are requested to attend the academic review meeting this Thursday at 3:30 PM in the Conference Hall. Please bring student evaluation registers.',
        targetRole: 'teacher',
        priority: 'medium',
        author: adminUser._id,
        date: new Date(2026, 2, 8),
      },
      {
        title: 'Parent-Teacher Conference (Term 1)',
        content:
          'Dear Parents, the Parent-Teacher Conference is scheduled for next Friday between 9:00 AM and 1:00 PM. Individual progress reports will be handed out.',
        targetRole: 'parent',
        priority: 'medium',
        author: adminUser._id,
        date: new Date(2026, 2, 12),
      },
      {
        title: 'Annual Sports & Athletic Gala Registrations',
        content:
          'Registrations for Track & Field events, Basketball, and Soccer tournaments are now open. Interested students can register with their sports captain by next Tuesday.',
        targetRole: 'student',
        priority: 'low',
        author: adminUser._id,
        date: new Date(2026, 2, 14),
      },
    ]);

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Credentials:');
    console.log('• Admin:    admin@school.com         / admin123');
    console.log('• Teacher:  sarah.johnson@school.com / teacher123');
    console.log('• Teacher:  david.smith@school.com   / teacher123');
    console.log('• Teacher:  maria.garcia@school.com  / teacher123');
    console.log('• Student:  student1@school.com      / student123 (to student20)');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
