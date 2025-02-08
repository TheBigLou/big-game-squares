"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Game_1 = require("../models/Game");
dotenv_1.default.config();
async function migrateScores() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        const games = await Game_1.Game.find({});
        console.log(`Found ${games.length} games to migrate`);
        for (const game of games) {
            // Ensure scores object exists
            if (!game.scores) {
                game.scores = {
                    current: { vertical: 0, horizontal: 0 },
                    firstQuarter: undefined,
                    secondQuarter: undefined,
                    thirdQuarter: undefined,
                    final: undefined
                };
            }
            // Ensure current scores exist
            if (!game.scores.current) {
                game.scores.current = { vertical: 0, horizontal: 0 };
            }
            // Mark the document as modified
            game.markModified('scores');
            await game.save();
            console.log(`Migrated game ${game.gameId}`);
        }
        console.log('Migration completed successfully');
    }
    catch (error) {
        console.error('Error during migration:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
}
migrateScores();
