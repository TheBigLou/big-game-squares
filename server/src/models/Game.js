"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var mongoose_1 = require("mongoose");
var gameSchema = new mongoose_1.Schema({
    gameId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    ownerEmail: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['setup', 'active', 'completed'],
        default: 'setup'
    },
    config: {
        squareCost: {
            type: Number,
            default: 0,
            min: 0
        },
        squareLimit: {
            type: Number,
            default: 100,
            min: 1,
            max: 100
        },
        scoring: {
            firstQuarter: { type: Number, default: 25 },
            secondQuarter: { type: Number, default: 25 },
            thirdQuarter: { type: Number, default: 25 },
            final: { type: Number, default: 25 }
        },
        teams: {
            vertical: { type: String, default: 'Team 1' },
            horizontal: { type: String, default: 'Team 2' }
        }
    },
    grid: {
        rows: [{ type: Number }],
        cols: [{ type: Number }],
        final: {
            rows: [{ type: Number }],
            cols: [{ type: Number }]
        }
    },
    scores: {
        current: {
            vertical: { type: Number, default: 0 },
            horizontal: { type: Number, default: 0 }
        },
        firstQuarter: {
            vertical: { type: Number },
            horizontal: { type: Number }
        },
        secondQuarter: {
            vertical: { type: Number },
            horizontal: { type: Number }
        },
        thirdQuarter: {
            vertical: { type: Number },
            horizontal: { type: Number }
        },
        final: {
            vertical: { type: Number },
            horizontal: { type: Number }
        }
    },
    currentQuarter: {
        type: String,
        enum: ['firstQuarter', 'secondQuarter', 'thirdQuarter', 'final'],
        default: 'firstQuarter'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    startedAt: Date,
    completedAt: Date
});
exports.Game = (0, mongoose_1.model)('Game', gameSchema);
