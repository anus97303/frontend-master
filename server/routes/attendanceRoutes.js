import express from 'express';
import { body } from 'express-validator';
import {
  getClassAttendance,
  markAttendance,
  getStudentAttendanceReport,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', getClassAttendance);

router.post(
  '/',
  authorize('admin', 'teacher'),
  [
    body('classId').isMongoId().withMessage('Valid Class ID is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('records').isArray({ min: 1 }).withMessage('Records array cannot be empty'),
    validate,
  ],
  markAttendance
);

router.get('/report/:studentId', getStudentAttendanceReport);

export default router;
