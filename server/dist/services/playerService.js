"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerService = void 0;
const Player_1 = require("../models/Player");
const Square_1 = require("../models/Square");
const Game_1 = require("../models/Game");
const errorHandler_1 = require("../utils/errorHandler");
class PlayerService {
    // Join a game
    static async joinGame({ gameId, email, name }) {
        var _a;
        const game = (_a = await Game_1.Game.findOne({ gameId })) !== null && _a !== void 0 ? _a : (0, errorHandler_1.throwNotFound)('Game not found');
        if (game.status !== 'setup') {
            (0, errorHandler_1.throwBadRequest)('Game is no longer accepting new players');
        }
        const normalizedEmail = email.toLowerCase();
        // Check if player already exists
        let player = await Player_1.Player.findOne({ gameId, email: normalizedEmail });
        if (!player) {
            player = new Player_1.Player({
                gameId,
                email: normalizedEmail,
                name
            });
            await player.save();
        }
        const squares = await Square_1.Square.find({ gameId, playerId: player._id });
        return { player, squares };
    }
    // Select a square
    static async selectSquare({ gameId, email, row, col }) {
        var _a, _b;
        const game = (_a = await Game_1.Game.findOne({ gameId })) !== null && _a !== void 0 ? _a : (0, errorHandler_1.throwNotFound)('Game not found');
        if (game.status !== 'setup') {
            (0, errorHandler_1.throwBadRequest)('Game is no longer accepting square selections');
        }
        const player = (_b = await Player_1.Player.findOne({
            gameId,
            email: email.toLowerCase()
        })) !== null && _b !== void 0 ? _b : (0, errorHandler_1.throwNotFound)('Player not found');
        // Check if square is already taken
        const existingSquare = await Square_1.Square.findOne({ gameId, row, col });
        if (existingSquare) {
            (0, errorHandler_1.throwBadRequest)('Square already taken');
        }
        // Check if player has reached square limit
        const playerSquares = await Square_1.Square.find({ gameId, playerId: player._id });
        if (playerSquares.length >= game.config.squareLimit) {
            (0, errorHandler_1.throwBadRequest)(`Maximum of ${game.config.squareLimit} squares per player reached`);
        }
        // Create new square
        const square = new Square_1.Square({
            gameId,
            playerId: player._id,
            row,
            col
        });
        await square.save();
        return { square };
    }
    // Get player's squares
    static async getPlayerSquares(gameId, email) {
        var _a;
        const player = (_a = await Player_1.Player.findOne({
            gameId,
            email: email.toLowerCase()
        })) !== null && _a !== void 0 ? _a : (0, errorHandler_1.throwNotFound)('Player not found');
        const squares = await Square_1.Square.find({ gameId, playerId: player._id });
        return { squares };
    }
    // Get all players in a game
    static async getGamePlayers(gameId) {
        const players = await Player_1.Player.find({ gameId });
        const squares = await Square_1.Square.find({ gameId });
        // Group squares by player
        const squaresByPlayer = squares.reduce((acc, square) => {
            const playerId = square.playerId.toString();
            if (!acc[playerId]) {
                acc[playerId] = [];
            }
            acc[playerId].push(square);
            return acc;
        }, {});
        const playersWithSquares = players.map(player => ({
            ...player.toObject(),
            squares: squaresByPlayer[player._id.toString()] || []
        }));
        return { players: playersWithSquares };
    }
}
exports.PlayerService = PlayerService;
