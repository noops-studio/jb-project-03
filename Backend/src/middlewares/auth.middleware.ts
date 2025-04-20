import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`Auth Middleware for ${req.method} ${req.path}`);
  
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.log("Auth failed: No authorization header");
    return res.status(401).json({ message: "Unauthorized - No auth header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("Auth failed: No token in authorization header");
    return res.status(401).json({ message: "Unauthorized - Invalid auth header format" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
      firstName: string;
      lastName: string;
    };
    req.user = payload;  // now recognized because of your declaration merge
    console.log(`Auth successful: User ${payload.id} (${payload.firstName}, role: ${payload.role})`);
    next();
  } catch (err) {
    console.log("Auth failed: Invalid token", err);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
}
