import express from 'express';
import { body } from 'express-validator';
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getTeachers)
  .post(
    authorize('admin'),
    upload.single('avatar'),
    [
      body('firstName').trim().notEmpty().withMessage('First name is required'),
      body('lastName').trim().notEmpty().withMessage('Last name is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('phone').trim().notEmpty().withMessage('Phone number is required'),
      body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
      validate,
    ],
    createTeacher
  );

router
  .route('/:id')
  .get(getTeacherById)
  .put(authorize('admin'), upload.single('avatar'), updateTeacher)
  .delete(authorize('admin'), deleteTeacher);

export default router;
