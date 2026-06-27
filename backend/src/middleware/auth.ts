import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-attendance-app";

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies.token;

  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized to access this route");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: "ADMIN" | "TEACHER" | "STUDENT"; name: string };
    
    // Fetch full user details to check status and keep session fresh
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new ApiError(401, "User belonging to this token no longer exists");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    
    next();
  } catch (error) {
    throw new ApiError(401, "Not authorized, token failed");
  }
});

// Role-based authorization middleware generators
export const restrictTo = (...roles: ("ADMIN" | "TEACHER" | "STUDENT")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, `User role '${req.user?.role}' is not authorized to access this resource`);
    }
    next();
  };
};

export const isAdmin = restrictTo("ADMIN");
export const isTeacher = restrictTo("TEACHER");
export const isStudent = restrictTo("STUDENT");
export const isTeacherOrAdmin = restrictTo("TEACHER", "ADMIN");
