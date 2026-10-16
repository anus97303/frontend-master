import express from 'express';
import { body } from 'express-validator';
import {
  getFees,
  recordFeePayment,
  getReceipt,
  getPendingFees,
  cancelFeePayment,
} from '../controllers/feeController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', getFees);
router.get('/pending', authorize('admin'), getPendingFees);
router.get('/receipt/:id', getReceipt);

router.post(
  '/pay',
  authorize('admin'),
  [
    body('studentId').isMongoId().withMessage('Valid Student ID is required'),
    body('classId').isMongoId().withMessage('Valid Class ID is required'),
    body('title').trim().notEmpty().withMessage('Fee title is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    validate,
  ],
  recordFeePayment
);

router.put('/cancel/:id', authorize('admin'), cancelFeePayment);

export default router;
