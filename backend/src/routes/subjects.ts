import { Router } from "express";
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjects";
import { protect, isAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createSubjectSchema, updateSubjectSchema } from "../validators";

const router = Router();

router.use(protect);

router
  .route("/")
  .get(getSubjects)
  .post(isAdmin, validate(createSubjectSchema), createSubject);

router
  .route("/:id")
  .get(getSubjectById)
  .put(isAdmin, validate(updateSubjectSchema), updateSubject)
  .delete(isAdmin, deleteSubject);

export default router;
