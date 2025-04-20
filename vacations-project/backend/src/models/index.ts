// src/models/index.ts
import sequelize from '../config/database';
import User from './User';
import Vacation from './Vacation';
import Follower from './Follower';

// Export models
export { User, Vacation, Follower };

// Initialize database
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('Database & tables synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
    throw error;
  }
};

export default {
  sequelize,
  User,
  Vacation,
  Follower,
};