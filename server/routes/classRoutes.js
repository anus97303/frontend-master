import express from 'express';
import { body } from 'express-validator';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} from '../controllers/classController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getClasses)
  .post(
    authorize('admin'),
    [
      body('name').trim().notEmpty().withMessage('Class name is required'),
      body('grade').trim().notEmpty().withMessage('Grade is required'),
      body('section').trim().notEmpty().withMessage('Section is required'),
      validate,
    ],
    createClass
  );

router
  .route('/:id')
  .get(getClassById)
  .put(authorize('admin'), updateClass)
  .delete(authorize('admin'), deleteClass);

export default router;
