import express from 'express';
import { body } from 'express-validator';
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getSubjects)
  .post(
    authorize('admin'),
    [
      body('name').trim().notEmpty().withMessage('Subject name is required'),
      body('code').trim().notEmpty().withMessage('Subject code is required'),
      body('classId').isMongoId().withMessage('Valid Class ID is required'),
      validate,
    ],
    createSubject
  );

router
  .route('/:id')
  .put(authorize('admin'), updateSubject)
  .delete(authorize('admin'), deleteSubject);

export default router;
