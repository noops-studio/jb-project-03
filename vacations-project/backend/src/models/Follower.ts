// src/models/Follower.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Vacation from './Vacation';

// Follower attributes interface
interface FollowerAttributes {
  userId: number;
  vacationId: number;
}

// Follower model class
class Follower extends Model<FollowerAttributes> implements FollowerAttributes {
  public userId!: number;
  public vacationId!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Follower model
Follower.init(
  {
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    vacationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      references: {
        model: Vacation,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'followers',
  }
);

// Define associations
User.belongsToMany(Vacation, {
  through: Follower,
  foreignKey: 'userId',
  as: 'followedVacations',
});

Vacation.belongsToMany(User, {
  through: Follower,
  foreignKey: 'vacationId',
  as: 'followers',
});

export default Follower;