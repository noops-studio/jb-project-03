import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      
      const user = await this.authService.register({
        firstName,
        lastName,
        email,
        password
      });

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      
      const { user, token } = await this.authService.login(email, password);

      res.status(200).json({ token, user });
    } catch (error) {
      next(error);
    }
  };
}
