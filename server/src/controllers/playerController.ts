import { Request, Response } from 'express';
import { Game } from '../models/Game';
import { Player } from '../models/Player';
import { Square } from '../models/Square';
import { PlayerService } from '../services/playerService';
import { handleError, throwNotFound, throwUnauthorized, throwBadRequest } from '../utils/errorHandler';

export const joinGame = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { name, email, password, venmoUsername } = req.body;

    const result = await PlayerService.joinGame({ gameId, email, name, password, venmoUsername });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error joining game' });
  }
};

export const selectSquare = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { email, row, col } = req.body;

    const game = await Game.findOne({ gameId });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'setup') {
      return res.status(400).json({ error: 'Game already started' });
    }

    const player = await Player.findOne({ gameId, email });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Check if square is already taken
    const existingSquare = await Square.findOne({ gameId, row, col });
    if (existingSquare) {
      return res.status(400).json({ error: 'Square already taken' });
    }

    // Check if player has reached their square limit
    const playerSquareCount = await Square.countDocuments({ 
      gameId, 
      playerId: player._id 
    });
    
    if (playerSquareCount >= game.config.squareLimit) {
      return res.status(400).json({ error: 'Square limit reached' });
    }

    const square = new Square({
      gameId,
      playerId: player._id,
      row,
      col,
    });

    await square.save();
    res.status(201).json({ square });
  } catch (error) {
    res.status(500).json({ error: 'Error selecting square' });
  }
};

export const getPlayerSquares = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { email } = req.query;

    const player = await Player.findOne({ gameId, email });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const squares = await Square.find({ 
      gameId, 
      playerId: player._id 
    });

    res.json({ squares });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching squares' });
  }
};

export const togglePlayerPayment = async (req: Request, res: Response) => {
  try {
    const { gameId, playerId } = req.params;
    const { ownerEmail } = req.body;

    // Find the game and verify owner
    const game = await Game.findOne({ gameId }) ?? throwNotFound('Game not found');
    if (game.ownerEmail.toLowerCase() !== ownerEmail.toLowerCase()) {
      throwUnauthorized();
    }

    // Find and update the player
    const player = await Player.findById(playerId) ?? throwNotFound('Player not found');
    if (player.gameId !== gameId) {
      throwNotFound('Player not found');
    }

    player.hasPaid = !player.hasPaid;
    await player.save();

    res.json({ player });
  } catch (error) {
    handleError(error, res);
  }
}; 