import jwt from 'jsonwebtoken';
import config from 'config';
import { User } from '../models/user.model';

interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export const generateToken = (user: User): string => {
  const payload = {
    id: user.id, // Now a UUID string
    role: user.role
  };

  const jwtConfig = config.get<JwtConfig>('jwt');
  
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};