import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-attendance-app";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "24h";

const generateToken = (payload: { id: string; email: string; role: string; name: string }) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES as any,
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, department, semester, section, rollNumber } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, "User already exists with this email");
  }

  // If roll number is provided for students, verify uniqueness
  if (rollNumber) {
    const rollExists = await User.findOne({ rollNumber });
    if (rollExists) {
      throw new ApiError(400, "User already exists with this roll number");
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    department,
    semester,
    section,
    rollNumber,
  });

  const responseData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    semester: user.semester,
    section: user.section,
    rollNumber: user.rollNumber,
  };

  res
    .status(201)
    .json(new ApiResponse(201, responseData, "User registered successfully"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const token = generateToken(tokenPayload);

  // Set HTTP-only Cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  const responseData = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    token,
  };

  res
    .status(200)
    .json(new ApiResponse(200, responseData, "Logged in successfully"));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Session expired or user not logged in");
  }

  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    throw new ApiError(404, "User profile not found");
  }

  res.status(200).json(new ApiResponse(200, user, "User profile retrieved"));
});
