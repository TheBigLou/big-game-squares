import { Router } from 'express';
import * as gameController from '../controllers/gameController';
import * as playerController from '../controllers/playerController';
import { validateUpdateScoreRequest, validateUpdateCurrentScoreRequest } from '../middleware/validation';

const router = Router();

// Game routes
router.post('/games', gameController.createGame as any);
router.get('/games/:gameId', gameController.getGame as any);
router.post('/games/:gameId/start', gameController.startGame as any);
router.post('/games/:gameId/score', validateUpdateScoreRequest, gameController.updateGameScore as any);
router.post('/games/:gameId/current-score', validateUpdateCurrentScoreRequest, gameController.updateCurrentScore as any);
router.post('/games/:gameId/pending-squares', gameController.updatePendingSquares as any);
router.get('/games/:gameId/pending-squares', gameController.getPendingSquares as any);

// Player routes
router.post('/games/:gameId/join', playerController.joinGame as any);
router.post('/games/:gameId/squares', playerController.selectSquare as any);
router.get('/games/:gameId/squares', playerController.getPlayerSquares as any);

export default router; 