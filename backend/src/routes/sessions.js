import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as sessionController from '../controllers/sessionController.js';

const router = express.Router();

router.post('/', authenticate, sessionController.createSession);
router.get('/', authenticate, sessionController.getSessions);
router.put('/:sessionId', authenticate, sessionController.updateSession);
router.delete('/:sessionId', authenticate, sessionController.deleteSession);

export default router;