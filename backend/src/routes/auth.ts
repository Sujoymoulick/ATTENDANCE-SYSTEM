import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/auth";
import { protect, isAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validators";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

// Public routes with rate limiting
router.post("/login", authLimiter, validate(loginSchema), login);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

// Register is Admin-only
router.post("/register", protect, isAdmin, validate(registerSchema), register);

export default router;
