"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const mongoose_1 = require("mongoose");
const playerSchema = new mongoose_1.Schema({
    gameId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});
// Compound index to ensure unique email per game
playerSchema.index({ gameId: 1, email: 1 }, { unique: true });
exports.Player = (0, mongoose_1.model)('Player', playerSchema);
