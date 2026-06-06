import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { updateSettings, getSettings } from '../controllers/usersController.js';

const router = express.Router();

router.use(authMiddleware);

router.put('/settings', updateSettings);
router.get('/settings', getSettings);

export default router;
