import { User, UserRole } from '../models/user.model';
import { AppError } from '../utils/error.utils';
import { generateToken } from '../utils/jwt.utils';

export class AuthService {
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: userData.email } });
    
    if (existingUser) {
      throw new AppError('Email already exists', 409, 'EMAIL_EXISTS');
    }

    // Create new user
    const user = await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      role: UserRole.USER
    });

    return user;
  }

  async login(email: string, password: string) {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Generate JWT token
    const token = generateToken(user);

    return { user, token };
  }
}