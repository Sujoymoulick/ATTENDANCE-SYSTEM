import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkUploadUsers,
} from "../controllers/users";
import { protect, isAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createUserSchema, updateUserSchema } from "../validators";

const router = Router();

// All user routes require admin role
router.use(protect);
router.use(isAdmin);

router
  .route("/")
  .get(getUsers)
  .post(validate(createUserSchema), createUser);

router.post("/bulk-upload", bulkUploadUsers);

router
  .route("/:id")
  .get(getUserById)
  .put(validate(updateUserSchema), updateUser)
  .delete(deleteUser);

export default router;
