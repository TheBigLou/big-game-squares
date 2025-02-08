"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Square = void 0;
const mongoose_1 = require("mongoose");
const squareSchema = new mongoose_1.Schema({
    gameId: {
        type: String,
        required: true,
        index: true
    },
    playerId: {
        type: String,
        required: true,
        index: true
    },
    row: {
        type: Number,
        required: true,
        min: 0,
        max: 9
    },
    col: {
        type: Number,
        required: true,
        min: 0,
        max: 9
    },
    selectedAt: {
        type: Date,
        default: Date.now
    }
});
// Compound index to ensure unique square per game
squareSchema.index({ gameId: 1, row: 1, col: 1 }, { unique: true });
// Compound index for quick lookups of player's squares
squareSchema.index({ gameId: 1, playerId: 1 });
exports.Square = (0, mongoose_1.model)('Square', squareSchema);
