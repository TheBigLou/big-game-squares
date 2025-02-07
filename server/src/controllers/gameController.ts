import { Request, Response } from 'express';
import { Game } from '../models/Game';
import { Player, IPlayer } from '../models/Player';
import { Square } from '../models/Square';
import { Document, Types } from 'mongoose';
import { generateGameId, generateRandomGrid, validateScoringConfig } from '../utils/gameUtils';
import { handleError, throwNotFound, throwUnauthorized, throwBadRequest } from '../utils/errorHandler';
import { Score, Quarter, DEFAULT_SCORES } from '../types/game';
import { GameService } from '../services/gameService';
import { PlayerService } from '../services/playerService';

// Add this near the top with other imports and types
interface PendingSquare {
  gameId: string;
  playerId: string;
  row: number;
  col: number;
  timestamp: number;
}

// Add this with other global variables
const pendingSquares = new Map<string, PendingSquare[]>();

// Clean up stale pending squares (older than 30 seconds)
const cleanupStalePendingSquares = () => {
  const now = Date.now();
  for (const [gameId, squares] of pendingSquares.entries()) {
    const filtered = squares.filter(s => now - s.timestamp < 30000);
    if (filtered.length === 0) {
      pendingSquares.delete(gameId);
    } else {
      pendingSquares.set(gameId, filtered);
    }
  }
};

// Helper function to calculate prize pool and payouts
const calculatePrizePool = async (gameId: string) => {
  const squares = await Square.find({ gameId });
  const game = await Game.findOne({ gameId });
  if (!game) throw new Error('Game not found');
  
  const totalSquares = squares.length;
  const prizePool = totalSquares * game.config.squareCost;
  
  // Calculate payouts based on scoring percentages
  const payouts = {
    firstQuarter: (prizePool * game.config.scoring.firstQuarter) / 100,
    secondQuarter: (prizePool * game.config.scoring.secondQuarter) / 100,
    thirdQuarter: (prizePool * game.config.scoring.thirdQuarter) / 100,
    final: (prizePool * game.config.scoring.final) / 100
  };
  
  return { prizePool, payouts };
};

export const createGame = async (req: Request, res: Response) => {
  try {
    const { name, ownerEmail, ownerName, config } = req.body;
    const result = await GameService.createGame({ name, ownerEmail, ownerName, config });
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const getGame = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const result = await GameService.getGame(gameId);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const startGame = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { ownerEmail } = req.body;
    const result = await GameService.startGame(gameId, ownerEmail);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const updateGameScore = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { ownerEmail, score, quarter } = req.body;
    const result = await GameService.updateScore({ gameId, ownerEmail, score, quarter });
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const updateCurrentScore = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { ownerEmail, score } = req.body;
    const result = await GameService.updateScore({ gameId, ownerEmail, score });
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const joinGame = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { email, name } = req.body;
    const result = await PlayerService.joinGame({ gameId, email, name });
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const selectSquare = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { email, row, col } = req.body;
    const result = await PlayerService.selectSquare({ gameId, email, row, col });
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const getPlayerSquares = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { email } = req.query;
    if (typeof email !== 'string') {
      throw new Error('Email is required');
    }
    const result = await PlayerService.getPlayerSquares(gameId, email);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const getGamePlayers = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const result = await PlayerService.getGamePlayers(gameId);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const updatePendingSquares = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { email, squares } = req.body;

    // Find the player
    const player = (await Player.findOne({ gameId, email: email.toLowerCase() })) as IPlayer & { _id: Types.ObjectId };
    if (!player) {
      throwNotFound('Player not found');
    }

    // Clean up stale entries first
    cleanupStalePendingSquares();

    // Get current pending squares for this game
    const gamePendingSquares = pendingSquares.get(gameId) || [];

    // Remove any existing pending squares for this player
    const otherPlayersPending = gamePendingSquares.filter(s => s.playerId !== player._id.toString());

    // Add the new pending squares for this player
    const playerPending = squares.map((s: { row: number; col: number; }) => ({
      gameId,
      playerId: player._id.toString(),
      row: s.row,
      col: s.col,
      timestamp: Date.now()
    }));

    // Update the pending squares map
    pendingSquares.set(gameId, [...otherPlayersPending, ...playerPending]);

    res.json({ pendingSquares: pendingSquares.get(gameId) || [] });
  } catch (error) {
    handleError(error, res);
  }
};

export const getPendingSquares = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    
    cleanupStalePendingSquares();
    res.json({ pendingSquares: pendingSquares.get(gameId) || [] });
  } catch (error) {
    handleError(error, res);
  }
}; 