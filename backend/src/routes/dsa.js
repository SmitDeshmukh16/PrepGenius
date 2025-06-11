import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as dsaController from '../controllers/dsaController.js';

const router = express.Router();

router.post('/topics', authenticate, dsaController.createTopic);
router.get('/topics', authenticate, dsaController.getTopics);
router.post('/topics/:topicId/questions', authenticate, dsaController.addQuestion);
router.delete('/topics/:topicId/questions/:questionId', authenticate, dsaController.deleteQuestion);
router.delete('/topics/:topicId', authenticate, dsaController.deleteTopic);

export default router;