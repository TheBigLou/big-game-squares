"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const Game_1 = require("../models/Game");
const Player_1 = require("../models/Player");
const Square_1 = require("../models/Square");
const gameUtils_1 = require("../utils/gameUtils");
const errorHandler_1 = require("../utils/errorHandler");
const game_1 = require("../types/game");
class GameService {
    // Helper function to calculate prize pool and payouts
    static async calculatePrizePool(gameId) {
        const squares = await Square_1.Square.find({ gameId });
        const game = await Game_1.Game.findOne({ gameId });
        if (!game)
            throw new Error('Game not found');
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
    static async createGame({ name, ownerEmail, ownerName, config }) {
        if (!(0, gameUtils_1.validateScoringConfig)(config.scoring)) {
            (0, errorHandler_1.throwBadRequest)('Invalid scoring configuration');
        }
        const gameId = (0, gameUtils_1.generateGameId)();
        const setupGrid = (0, gameUtils_1.generateRandomGrid)();
        const finalGrid = (0, gameUtils_1.generateRandomGrid)();
        const game = new Game_1.Game({
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
        const player = new Player_1.Player({
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
    static async getGame(gameId) {
        var _a;
        const game = (_a = await Game_1.Game.findOne({ gameId })) !== null && _a !== void 0 ? _a : (0, errorHandler_1.throwNotFound)('Game not found');
        const [players, squares] = await Promise.all([
            Player_1.Player.find({ gameId }),
            Square_1.Square.find({ gameId })
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
    static async startGame(gameId, ownerEmail) {
        var _a;
        const game = (_a = await Game_1.Game.findOne({ gameId })) !== null && _a !== void 0 ? _a : (0, errorHandler_1.throwNotFound)('Game not found');
        if (game.ownerEmail !== ownerEmail) {
            (0, errorHandler_1.throwUnauthorized)();
        }
        if (game.status !== 'setup') {
            (0, errorHandler_1.throwBadRequest)('Game already started');
        }
        if (!game.grid.final) {
            (0, errorHandler_1.throwBadRequest)('Game grid not properly initialized');
        }
        game.status = 'active';
        game.startedAt = new Date();
        await game.save();
        const squares = await Square_1.Square.find({ gameId });
        return { game, squares };
    }
    // Update game score
    static async updateScore({ gameId, ownerEmail, score, quarter }) {
        var _a;
        const game = (_a = await Game_1.Game.findOne({ gameId })) !== null && _a !== void 0 ? _a : (0, errorHandler_1.throwNotFound)('Game not found');
        if (game.ownerEmail !== ownerEmail) {
            (0, errorHandler_1.throwUnauthorized)();
        }
        if (game.status !== 'active') {
            (0, errorHandler_1.throwBadRequest)('Game not active');
        }
        // Initialize scores if needed
        if (!game.scores) {
            game.scores = game_1.DEFAULT_SCORES;
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
exports.GameService = GameService;
