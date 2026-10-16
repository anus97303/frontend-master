import express from 'express';
import { body } from 'express-validator';
import {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  saveResult,
  getStudentResults,
  getClassExamResults,
} from '../controllers/examController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getExams)
  .post(
    authorize('admin'),
    [
      body('title').trim().notEmpty().withMessage('Exam title is required'),
      body('term').trim().notEmpty().withMessage('Exam term is required'),
      body('startDate').notEmpty().withMessage('Start date is required'),
      body('endDate').notEmpty().withMessage('End date is required'),
      validate,
    ],
    createExam
  );

router
  .route('/:id')
  .put(authorize('admin'), updateExam)
  .delete(authorize('admin'), deleteExam);

// Results sub-routes
router.post('/results', authorize('admin', 'teacher'), saveResult);
router.get('/results/student/:id', getStudentResults);
router.get('/results/class', getClassExamResults);

export default router;
