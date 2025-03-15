// src/models/index.ts
import { Sequelize } from 'sequelize-typescript';
import config from 'config';
import { User } from './user.model';
import { Vacation } from './vacation.model';
import { Follower } from './follower.model';

// Define the database config interface
interface DbConfig {
  host: string;
  port: number;
  database: string;
  dialect: string;
  username: string;
  password: string;
}

// Get database config and cast it to our interface
const dbConfig = config.get<DbConfig>('database');

const sequelize = new Sequelize({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  dialect: dbConfig.dialect as 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql',
  username: dbConfig.username,
  password: dbConfig.password,
  models: [User, Vacation, Follower],
  logging: console.log // You can customize based on logging configuration
});

export { sequelize, User, Vacation, Follower };