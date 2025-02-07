import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Game } from '../models/Game';

dotenv.config();

async function migrateScores() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const games = await Game.find({});
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
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateScores(); 