import express from 'express';
import { body } from 'express-validator';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getStudents)
  .post(
    authorize('admin'),
    upload.single('avatar'),
    [
      body('firstName').trim().notEmpty().withMessage('First name is required'),
      body('lastName').trim().notEmpty().withMessage('Last name is required'),
      body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
      body('dob').notEmpty().withMessage('Date of birth is required'),
      body('classId').isMongoId().withMessage('Valid Class ID is required'),
      body('guardianName').trim().notEmpty().withMessage('Guardian name is required'),
      body('guardianPhone').trim().notEmpty().withMessage('Guardian phone is required'),
      validate,
    ],
    createStudent
  );

router
  .route('/:id')
  .get(getStudentById)
  .put(authorize('admin'), upload.single('avatar'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

export default router;
