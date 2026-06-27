import { Router } from "express";
import {
  markAttendance,
  bulkMarkAttendance,
  updateAttendance,
  getStudentAttendance,
  getClassAttendance,
  getSubjectAttendanceHistory,
  generateReports,
  getDashboardStats,
} from "../controllers/attendance";
import { protect, isTeacher, isTeacherOrAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  markAttendanceSchema,
  bulkAttendanceSchema,
  updateAttendanceSchema,
} from "../validators";

const router = Router();

router.use(protect);

// Stats & Student personal attendance
router.get("/stats", getDashboardStats);
router.get("/student", getStudentAttendance);

// Class list, Subject history & Reports (Teachers & Admins)
router.get("/class", isTeacherOrAdmin, getClassAttendance);
router.get("/subject-history", isTeacherOrAdmin, getSubjectAttendanceHistory);
router.get("/reports", isTeacherOrAdmin, generateReports);

// Mark Attendance (Teachers)
router.post("/", isTeacher, validate(markAttendanceSchema), markAttendance);
router.post("/bulk", isTeacher, validate(bulkAttendanceSchema), bulkMarkAttendance);

// Edit Attendance + create Audit Log (Teachers & Admins)
router.put("/:id", isTeacherOrAdmin, validate(updateAttendanceSchema), updateAttendance);

export default router;
