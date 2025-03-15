import config from 'config';
import app from './app';
import { sequelize } from './models';

interface ServerConfig {
  port: number;
  host: string;
}

const serverConfig = config.get<ServerConfig>('server');
const PORT = serverConfig.port;
const HOST = serverConfig.host;

// Start the server
const startServer = async () => {
  try {
    // Sync database
    await sequelize.sync();
    console.log('Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();