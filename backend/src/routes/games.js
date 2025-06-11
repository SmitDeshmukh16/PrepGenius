import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as gameController from '../controllers/gameController.js';

const router = express.Router();

router.post('/', authenticate, gameController.createGame);
router.get('/', authenticate, gameController.getGames);
router.delete('/:gameId', authenticate, gameController.deleteGame);

export default router;