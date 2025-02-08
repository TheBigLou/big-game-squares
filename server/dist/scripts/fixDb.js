"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function fixDatabase() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        const db = mongoose_1.default.connection.db;
        if (!db) {
            throw new Error('Database connection not initialized');
        }
        // Drop the problematic index
        try {
            await db.collection('games').dropIndex('nanoId_1');
            console.log('Successfully dropped nanoId index');
        }
        catch (error) {
            console.log('No nanoId index found to drop');
        }
        try {
            await db.collection('games').dropIndex('gameId_1');
            console.log('Successfully dropped gameId index');
        }
        catch (error) {
            console.log('No gameId index found to drop');
        }
        // Remove any documents with null gameId
        const result = await db.collection('games').deleteMany({
            $or: [
                { gameId: null },
                { gameId: { $exists: false } }
            ]
        });
        console.log(`Removed ${result.deletedCount} invalid game documents`);
        // Create the correct index
        await db.collection('games').createIndex({ gameId: 1 }, { unique: true });
        console.log('Successfully created gameId index');
    }
    catch (error) {
        console.error('Error fixing database:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
}
fixDatabase();
