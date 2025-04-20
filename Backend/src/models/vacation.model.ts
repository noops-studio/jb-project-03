import { DataTypes } from "sequelize";
import { sequelize } from "../config/db";

export const Vacation = sequelize.define("Vacation", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  destination: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(1000),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  },
  imageFileName: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: "Vacations",
  timestamps: false
});
