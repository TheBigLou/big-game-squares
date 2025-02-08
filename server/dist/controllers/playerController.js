"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerSquares = exports.selectSquare = exports.joinGame = void 0;
const Game_1 = require("../models/Game");
const Player_1 = require("../models/Player");
const Square_1 = require("../models/Square");
const joinGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { name, email } = req.body;
        const game = await Game_1.Game.findOne({ gameId });
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        // Check if player already exists in this game
        const existingPlayer = await Player_1.Player.findOne({ gameId, email: email.toLowerCase() });
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
        const player = new Player_1.Player({
            gameId,
            name,
            email: email.toLowerCase(),
        });
        await player.save();
        res.status(201).json({ player });
    }
    catch (error) {
        res.status(500).json({ error: 'Error joining game' });
    }
};
exports.joinGame = joinGame;
const selectSquare = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { email, row, col } = req.body;
        const game = await Game_1.Game.findOne({ gameId });
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        if (game.status !== 'setup') {
            return res.status(400).json({ error: 'Game already started' });
        }
        const player = await Player_1.Player.findOne({ gameId, email });
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        // Check if square is already taken
        const existingSquare = await Square_1.Square.findOne({ gameId, row, col });
        if (existingSquare) {
            return res.status(400).json({ error: 'Square already taken' });
        }
        // Check if player has reached their square limit
        const playerSquareCount = await Square_1.Square.countDocuments({
            gameId,
            playerId: player._id
        });
        if (playerSquareCount >= game.config.squareLimit) {
            return res.status(400).json({ error: 'Square limit reached' });
        }
        const square = new Square_1.Square({
            gameId,
            playerId: player._id,
            row,
            col,
        });
        await square.save();
        res.status(201).json({ square });
    }
    catch (error) {
        res.status(500).json({ error: 'Error selecting square' });
    }
};
exports.selectSquare = selectSquare;
const getPlayerSquares = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { email } = req.query;
        const player = await Player_1.Player.findOne({ gameId, email });
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        const squares = await Square_1.Square.find({
            gameId,
            playerId: player._id
        });
        res.json({ squares });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching squares' });
    }
};
exports.getPlayerSquares = getPlayerSquares;
