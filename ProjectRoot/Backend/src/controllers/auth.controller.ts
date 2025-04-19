import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";

export const AuthController = {
  // User registration
  register: async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      // Check if email already exists
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: "Email is already in use" });
      }
      // Hash the password
      const hashed = await bcrypt.hash(password, 10);
      // Create new user (regular user by default)
      const newUser = await User.create({ firstName, lastName, email, password: hashed, role: "user" });
      const userData = {
        id: newUser.get("id"),
        firstName: newUser.get("firstName"),
        lastName: newUser.get("lastName"),
        email: newUser.get("email"),
        role: newUser.get("role")
      };
      // Generate JWT token for the new user
      const token = generateToken({ 
        id: userData.id as number, 
        role: userData.role as string, 
        firstName: userData.firstName as string, 
        lastName: userData.lastName as string 
      });
      return res.status(201).json({ token, user: userData });
    } catch (err) {
      console.error("Error in register:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // User login
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      // Check password
      const passwordMatches = await bcrypt.compare(password, user.get("password") as string);
      if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      // Prepare user data for response (omit password hash)
      const userData = {
        id: user.get("id"),
        firstName: user.get("firstName"),
        lastName: user.get("lastName"),
        email: user.get("email"),
        role: user.get("role")
      };
      // Generate JWT token
      const token = generateToken({ 
        id: userData.id as number, 
        role: userData.role as string, 
        firstName: userData.firstName as string, 
        lastName: userData.lastName as string 
      });
      return res.json({ token, user: userData });
    } catch (err) {
      console.error("Error in login:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
};
