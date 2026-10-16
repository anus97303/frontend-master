import express from 'express';
import { body } from 'express-validator';
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getNotices)
  .post(
    authorize('admin'),
    [
      body('title').trim().notEmpty().withMessage('Notice title is required'),
      body('content').trim().notEmpty().withMessage('Notice content is required'),
      validate,
    ],
    createNotice
  );

router
  .route('/:id')
  .put(authorize('admin'), updateNotice)
  .delete(authorize('admin'), deleteNotice);

export default router;
