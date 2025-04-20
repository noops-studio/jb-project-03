import { Request, Response, NextFunction } from "express";

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  // authMiddleware should run before this, so req.user is set
  if (!req.user) {
    console.error("Admin Middleware: req.user is undefined - authMiddleware must be applied first");
    return res.status(403).json({ message: "Authentication required before admin check" });
  }
  
  console.log(`Admin Middleware: User ${req.user.id} (${req.user.firstName}) has role ${req.user.role}`);
  
  if (req.user.role !== "admin") {
    console.log(`Access denied: User ${req.user.id} with role ${req.user.role} attempted to access admin route`);
    return res.status(403).json({ message: "Admin privileges required" });
  }
  
  next();
}
