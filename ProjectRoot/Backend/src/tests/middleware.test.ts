import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import jwt from "jsonwebtoken";

// Helper to create a dummy request, response, and next for testing
const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Auth Middleware", () => {
  const SECRET = process.env.JWT_SECRET || "changeme";

  it("should return 401 if no Authorization header is present", () => {
    const req: any = { headers: {} };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should allow request if a valid token is provided", () => {
    // Create a valid token for a dummy user
    const token = jwt.sign({ id: 42, role: "user" }, SECRET);
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();            // next() called, meaning authentication passed
    expect(req.user.id).toBe(42);
    expect(req.user.role).toBe("user");
  });
});

describe("Admin Middleware", () => {
  it("should return 403 if user is not admin", () => {
    const req: any = { user: { role: "user" } };
    const res = createMockRes();
    const next = jest.fn();

    adminMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should allow request if user is admin", () => {
    const req: any = { user: { role: "admin" } };
    const res = createMockRes();
    const next = jest.fn();

    adminMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
