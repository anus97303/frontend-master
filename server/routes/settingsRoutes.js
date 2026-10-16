import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.get('/', getSettings);
router.put('/', authorize('admin'), updateSettings);

export default router;
