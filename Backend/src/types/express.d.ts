declare namespace Express {
    export interface Request {
      user?: {
        id: number;
        role: string;
        firstName: string;
        lastName: string;
      }
    }
  }
  