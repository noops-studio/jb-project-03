
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// Define Vacation attributes
interface VacationAttributes {
  vacationId: number;
  destination: string;
  description: string;
  startDate: Date;
  endDate: Date;
  price: number;
  imageFileName: string;
}

// For creating a new Vacation (vacationId is optional as it's auto-generated)
interface VacationCreationAttributes extends Optional<VacationAttributes, 'vacationId'> {}

class Vacation extends Model<VacationAttributes, VacationCreationAttributes> implements VacationAttributes {
  public vacationId!: number;
  public destination!: string;
  public description!: string;
  public startDate!: Date;
  public endDate!: Date;
  public price!: number;
  public imageFileName!: string;
}

Vacation.init(
  {
    vacationId: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isAfterStartDate(value: Date) {
          if (new Date(value) <= new Date(this.startDate)) {
            throw new Error('End date must be after start date');
          }
        },
      },
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
    modelName: 'Vacation',
    tableName: 'vacations',
  }
);

export default Vacation;
