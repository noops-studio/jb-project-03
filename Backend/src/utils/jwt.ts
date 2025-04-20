import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const JWT_EXPIRES_IN = "1d";  // token validity duration

interface UserPayload {
  id: number;
  role: string;
  firstName: string;
  lastName: string;
}

export function generateToken(userPayload: UserPayload): string {
  // Sign a JWT with user id and role (and optionally name) in payload
  return jwt.sign(userPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
