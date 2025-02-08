"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingSquares = exports.updatePendingSquares = exports.getGamePlayers = exports.getPlayerSquares = exports.selectSquare = exports.joinGame = exports.updateCurrentScore = exports.updateGameScore = exports.startGame = exports.getGame = exports.createGame = void 0;
const Game_1 = require("../models/Game");
const Player_1 = require("../models/Player");
const Square_1 = require("../models/Square");
const errorHandler_1 = require("../utils/errorHandler");
const gameService_1 = require("../services/gameService");
const playerService_1 = require("../services/playerService");
// Add this with other global variables
const pendingSquares = new Map();
// Clean up stale pending squares (older than 30 seconds)
const cleanupStalePendingSquares = () => {
    const now = Date.now();
    for (const [gameId, squares] of pendingSquares.entries()) {
        const filtered = squares.filter(s => now - s.timestamp < 30000);
        if (filtered.length === 0) {
            pendingSquares.delete(gameId);
        }
        else {
            pendingSquares.set(gameId, filtered);
        }
    }
};
// Helper function to calculate prize pool and payouts
const calculatePrizePool = async (gameId) => {
    const squares = await Square_1.Square.find({ gameId });
    const game = await Game_1.Game.findOne({ gameId });
    if (!game)
        throw new Error('Game not found');
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
const createGame = async (req, res) => {
    try {
        const { name, ownerEmail, ownerName, config } = req.body;
        const result = await gameService_1.GameService.createGame({ name, ownerEmail, ownerName, config });
        res.json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.createGame = createGame;
const getGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const result = await gameService_1.GameService.getGame(gameId);
        res.json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.getGame = getGame;
const startGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { ownerEmail } = req.body;
        const result = await gameService_1.GameService.startGame(gameId, ownerEmail);
        res.json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.startGame = startGame;
const updateGameScore = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { ownerEmail, score, quarter } = req.body;
        const result = await gameService_1.GameService.updateScore({ gameId, ownerEmail, score, quarter });
        res.json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.updateGameScore = updateGameScore;
const updateCurrentScore = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { ownerEmail, score } = req.body;
        const result = await gameService_1.GameService.updateScore({ gameId, ownerEmail, score });
        res.json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.updateCurrentScore = updateCurrentScore;
const joinGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { email, name } = req.body;
        const result = await playerService_1.PlayerService.joinGame({ gameId, email, name });
        res.json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.joinGame = joinGame;
const selectSquare = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { email, row, col } = req.body;
        const result = await playerService_1.PlayerService.selectSquare({ gameId, email, row, col });
        res.json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.selectSquare = selectSquare;
const getPlayerSquares = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { email } = req.query;
        if (typeof email !== 'string') {
            throw new Error('Email is required');
        }
        const result = await playerService_1.PlayerService.getPlayerSquares(gameId, email);
        res.json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.getPlayerSquares = getPlayerSquares;
const getGamePlayers = async (req, res) => {
    try {
        const { gameId } = req.params;
        const result = await playerService_1.PlayerService.getGamePlayers(gameId);
        res.json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.getGamePlayers = getGamePlayers;
const updatePendingSquares = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { email, squares } = req.body;
        // Find the player
        const player = (await Player_1.Player.findOne({ gameId, email: email.toLowerCase() }));
        if (!player) {
            (0, errorHandler_1.throwNotFound)('Player not found');
        }
        // Clean up stale entries first
        cleanupStalePendingSquares();
        // Get current pending squares for this game
        const gamePendingSquares = pendingSquares.get(gameId) || [];
        // Remove any existing pending squares for this player
        const otherPlayersPending = gamePendingSquares.filter(s => s.playerId !== player._id.toString());
        // Add the new pending squares for this player
        const playerPending = squares.map((s) => ({
            gameId,
            playerId: player._id.toString(),
            row: s.row,
            col: s.col,
            timestamp: Date.now()
        }));
        // Update the pending squares map
        pendingSquares.set(gameId, [...otherPlayersPending, ...playerPending]);
        res.json({ pendingSquares: pendingSquares.get(gameId) || [] });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.updatePendingSquares = updatePendingSquares;
const getPendingSquares = async (req, res) => {
    try {
        const { gameId } = req.params;
        cleanupStalePendingSquares();
        res.json({ pendingSquares: pendingSquares.get(gameId) || [] });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.getPendingSquares = getPendingSquares;
