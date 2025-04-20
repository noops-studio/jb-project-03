
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Vacation from './Vacation';

// Define Follower attributes - composite key of userId and vacationId
interface FollowerAttributes {
  userId: number;
  vacationId: number;
}

// The same attributes are required for creation
interface FollowerCreationAttributes extends FollowerAttributes {}

class Follower extends Model<FollowerAttributes, FollowerCreationAttributes> implements FollowerAttributes {
  public userId!: number;
  public vacationId!: number;
}

Follower.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: User,
        key: 'userId',
      },
    },
    vacationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Vacation,
        key: 'vacationId',
      },
    },
  },
  {
    sequelize,
    modelName: 'Follower',
    tableName: 'followers',
  }
);

// Define associations
User.belongsToMany(Vacation, {
  through: Follower,
  foreignKey: 'userId',
  otherKey: 'vacationId',
});

Vacation.belongsToMany(User, {
  through: Follower,
  foreignKey: 'vacationId',
  otherKey: 'userId',
});

export default Follower;
