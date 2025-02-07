import { Request, Response } from 'express';
import { Game } from '../models/Game';
import { Player } from '../models/Player';
import { Square } from '../models/Square';

export const joinGame = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { name, email } = req.body;

    const game = await Game.findOne({ gameId });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if player already exists in this game
    const existingPlayer = await Player.findOne({ gameId, email: email.toLowerCase() });
    if (existingPlayer) {
      // If the player exists but with a different name, update their name
      if (existingPlayer.name !== name) {
        existingPlayer.name = name;
        await existingPlayer.save();
      }
      return res.status(200).json({ player: existingPlayer });
    }

    // Only check game status for new players
    if (game.status !== 'setup') {
      return res.status(400).json({ error: 'Game already started' });
    }

    const player = new Player({
      gameId,
      name,
      email: email.toLowerCase(),
    });

    await player.save();
    res.status(201).json({ player });
  } catch (error) {
    res.status(500).json({ error: 'Error joining game' });
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