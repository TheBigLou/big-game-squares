import { Player } from '../models/Player';
import { Square } from '../models/Square';
import { Game } from '../models/Game';
import { throwNotFound, throwBadRequest } from '../utils/errorHandler';

interface JoinGameParams {
  gameId: string;
  email: string;
  name: string;
}

interface SelectSquareParams {
  gameId: string;
  email: string;
  row: number;
  col: number;
}

export class PlayerService {
  // Join a game
  static async joinGame({ gameId, email, name }: JoinGameParams) {
    const game = await Game.findOne({ gameId }) ?? throwNotFound('Game not found');
    
    if (game.status !== 'setup') {
      throwBadRequest('Game is no longer accepting new players');
    }

    const normalizedEmail = email.toLowerCase();
    
    // Check if player already exists
    let player = await Player.findOne({ gameId, email: normalizedEmail });
    
    if (!player) {
      player = new Player({
        gameId,
        email: normalizedEmail,
        name
      });
      await player.save();
    }

    const squares = await Square.find({ gameId, playerId: player._id });
    return { player, squares };
  }

  // Select a square
  static async selectSquare({ gameId, email, row, col }: SelectSquareParams) {
    const game = await Game.findOne({ gameId }) ?? throwNotFound('Game not found');
    
    if (game.status !== 'setup') {
      throwBadRequest('Game is no longer accepting square selections');
    }

    const player = await Player.findOne({ 
      gameId, 
      email: email.toLowerCase() 
    }) ?? throwNotFound('Player not found');

    // Check if square is already taken
    const existingSquare = await Square.findOne({ gameId, row, col });
    if (existingSquare) {
      throwBadRequest('Square already taken');
    }

    // Check if player has reached square limit
    const playerSquares = await Square.find({ gameId, playerId: player._id });
    if (game.config.maxSquaresPerPlayer && playerSquares.length >= game.config.maxSquaresPerPlayer) {
      throwBadRequest(`Maximum of ${game.config.maxSquaresPerPlayer} squares per player reached`);
    }

    // Create new square
    const square = new Square({
      gameId,
      playerId: player._id,
      row,
      col
    });
    await square.save();

    return { square };
  }

  // Get player's squares
  static async getPlayerSquares(gameId: string, email: string) {
    const player = await Player.findOne({ 
      gameId, 
      email: email.toLowerCase() 
    }) ?? throwNotFound('Player not found');

    const squares = await Square.find({ gameId, playerId: player._id });
    return { squares };
  }

  // Get all players in a game
  static async getGamePlayers(gameId: string) {
    const players = await Player.find({ gameId });
    const squares = await Square.find({ gameId });

    // Group squares by player
    const squaresByPlayer = squares.reduce((acc, square) => {
      const playerId = square.playerId.toString();
      if (!acc[playerId]) {
        acc[playerId] = [];
      }
      acc[playerId].push(square);
      return acc;
    }, {} as Record<string, typeof squares>);

    const playersWithSquares = players.map(player => ({
      ...player.toObject(),
      squares: squaresByPlayer[player._id.toString()] || []
    }));

    return { players: playersWithSquares };
  }
} 