import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load environment variables from .env if present
dotenv.config();

// Read DB config from environment or use defaults
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "vacation_db";

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,  // disable logging SQL queries
  define: {
    freezeTableName: true  // use model names as table names without pluralizing
  }
});
