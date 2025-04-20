import { DataTypes } from "sequelize";
import { sequelize } from "../config/db";
import { User } from "./user.model";
import { Vacation } from "./vacation.model";

export const Follower = sequelize.define("Follower", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: "id" }
  },
  vacationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Vacation, key: "id" }
  }
}, {
  tableName: "Followers",
  timestamps: false,
  indexes: [
    { unique: true, fields: ["userId", "vacationId"] }  // ensure one follow per user-vacation pair
  ]
});

// Define model associations (Many-to-Many through Followers)
User.belongsToMany(Vacation, { through: Follower, foreignKey: "userId", otherKey: "vacationId" });
Vacation.belongsToMany(User, { through: Follower, foreignKey: "vacationId", otherKey: "userId", as: "followers" });
