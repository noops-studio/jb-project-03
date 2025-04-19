import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
      firstName: string;
      lastName: string;
    };
    req.user = payload;  // now recognized because of your declaration merge
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
