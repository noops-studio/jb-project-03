// src/models/Vacation.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Vacation attributes interface
interface VacationAttributes {
  id: number;
  destination: string;
  description: string;
  startDate: Date;
  endDate: Date;
  price: number;
  imageFileName: string;
}

// Vacation creation attributes interface (optional id for creation)
interface VacationCreationAttributes extends Optional<VacationAttributes, 'id'> {}

// Vacation model class
class Vacation extends Model<VacationAttributes, VacationCreationAttributes> implements VacationAttributes {
  public id!: number;
  public destination!: string;
  public description!: string;
  public startDate!: Date;
  public endDate!: Date;
  public price!: number;
  public imageFileName!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Vacation model
Vacation.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    destination: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 10000,
      },
    },
    imageFileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'vacations',
  }
);

export default Vacation;