import { Game } from '../models/Game';
import { Player } from '../models/Player';
import { Square } from '../models/Square';
import { generateGameId, generateRandomGrid, validateScoringConfig } from '../utils/gameUtils';
import { throwNotFound, throwUnauthorized, throwBadRequest } from '../utils/errorHandler';
import { Score, Quarter, DEFAULT_SCORES, GameConfig } from '../types/game';

interface CreateGameParams {
  name: string;
  ownerEmail: string;
  ownerName: string;
  config: GameConfig;
}

interface UpdateScoreParams {
  gameId: string;
  ownerEmail: string;
  score: Score;
  quarter?: Quarter;
}

export class GameService {
  // Helper function to calculate prize pool and payouts
  private static async calculatePrizePool(gameId: string) {
    const squares = await Square.find({ gameId });
    const game = await Game.findOne({ gameId });
    if (!game) throw new Error('Game not found');
    
    const totalSquares = squares.length;
    const prizePool = totalSquares * game.config.squareCost;
    
    const payouts = {
      firstQuarter: (prizePool * game.config.scoring.firstQuarter) / 100,
      secondQuarter: (prizePool * game.config.scoring.secondQuarter) / 100,
      thirdQuarter: (prizePool * game.config.scoring.thirdQuarter) / 100,
      final: (prizePool * game.config.scoring.final) / 100
    };
    
    return { prizePool, payouts };
  }

  // Create a new game
  static async createGame({ name, ownerEmail, ownerName, config }: CreateGameParams) {
    if (!validateScoringConfig(config.scoring)) {
      throwBadRequest('Invalid scoring configuration');
    }

    const gameId = generateGameId();
    const setupGrid = generateRandomGrid();
    const finalGrid = generateRandomGrid();
    
    const game = new Game({
      gameId,
      name,
      ownerEmail,
      config,
      grid: {
        rows: setupGrid.rows,
        cols: setupGrid.cols,
        final: {
          rows: finalGrid.rows,
          cols: finalGrid.cols
        }
      },
      scores: {
        current: { vertical: 0, horizontal: 0 }
      },
      currentQuarter: 'firstQuarter',
      status: 'setup'
    });

    await game.save();

    // Create the owner as the first player
    const player = new Player({
      gameId,
      name: ownerName,
      email: ownerEmail.toLowerCase(),
    });
    await player.save();

    // Don't send the final grid in the response
    const gameResponse = game.toObject();
    delete gameResponse.grid.final;
    
    return { game: gameResponse, accessLink: `/game/${gameId}` };
  }

  // Get game details
  static async getGame(gameId: string) {
    const game = await Game.findOne({ gameId }) ?? throwNotFound('Game not found');

    const [players, squares] = await Promise.all([
      Player.find({ gameId }),
      Square.find({ gameId })
    ]);
    
    const { prizePool, payouts } = await this.calculatePrizePool(gameId);

    // Don't send the final grid unless game is active
    const gameResponse = game.toObject();
    if (game.status === 'setup') {
      delete gameResponse.grid.final;
    }

    return { 
      game: gameResponse, 
      players, 
      squares,
      prizePool,
      payouts
    };
  }

  // Start a game
  static async startGame(gameId: string, ownerEmail: string) {
    const game = await Game.findOne({ gameId }) ?? throwNotFound('Game not found');

    if (game.ownerEmail !== ownerEmail) {
      throwUnauthorized();
    }

    if (game.status !== 'setup') {
      throwBadRequest('Game already started');
    }

    if (!game.grid.final) {
      throwBadRequest('Game grid not properly initialized');
    }

    game.status = 'active';
    game.startedAt = new Date();
    await game.save();

    const squares = await Square.find({ gameId });
    return { game, squares };
  }

  // Update game score
  static async updateScore({ gameId, ownerEmail, score, quarter }: UpdateScoreParams) {
    const game = await Game.findOne({ gameId }) ?? throwNotFound('Game not found');

    if (game.ownerEmail !== ownerEmail) {
      throwUnauthorized();
    }

    if (game.status !== 'active') {
      throwBadRequest('Game not active');
    }

    // Initialize scores if needed
    if (!game.scores) {
      game.scores = DEFAULT_SCORES;
    }

    // Update scores
    game.scores.current = score;
    
    if (quarter) {
      game.scores[quarter] = score;
      game.currentQuarter = quarter;

      // Update game status if final
      if (quarter === 'final') {
        game.status = 'completed';
        game.completedAt = new Date();
      }
    }

    game.markModified('scores');
    await game.save();

    return { game };
  }
} 