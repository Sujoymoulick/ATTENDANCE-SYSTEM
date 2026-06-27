import { z } from "zod";
import { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdValidation = z.string().refine((val) => objectIdRegex.test(val), {
  message: "Invalid MongoDB ObjectId format",
});

// Auth Validators
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
    department: z.string().optional(),
    semester: z.string().optional(),
    section: z.string().optional(),
    rollNumber: z.string().optional(),
  }),
});

// User Validators
export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
    department: z.string().optional(),
    semester: z.string().optional(),
    section: z.string().optional(),
    rollNumber: z.string().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address").optional(),
    role: z.enum(["ADMIN", "TEACHER", "STUDENT"]).optional(),
    department: z.string().optional(),
    semester: z.string().optional(),
    section: z.string().optional(),
    rollNumber: z.string().optional(),
  }),
});

// Subject Validators
export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Subject name must be at least 2 characters"),
    code: z.string().min(2, "Subject code must be at least 2 characters"),
    teacher: objectIdValidation,
    semester: z.string().min(1, "Semester is required"),
    department: z.string().min(1, "Department is required"),
  }),
});

export const updateSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Subject name must be at least 2 characters").optional(),
    code: z.string().min(2, "Subject code must be at least 2 characters").optional(),
    teacher: objectIdValidation.optional(),
    semester: z.string().min(1, "Semester is required").optional(),
    department: z.string().min(1, "Department is required").optional(),
  }),
});

// Attendance Validators
export const markAttendanceSchema = z.object({
  body: z.object({
    student: objectIdValidation,
    subject: objectIdValidation,
    date: z.string().datetime({ message: "Invalid date format, must be ISO string" }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")),
    status: z.enum(["Present", "Absent", "Late"]),
    remarks: z.string().optional(),
  }),
});

export const bulkAttendanceSchema = z.object({
  body: z.object({
    subject: objectIdValidation,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    records: z.array(
      z.object({
        student: objectIdValidation,
        status: z.enum(["Present", "Absent", "Late"]),
        remarks: z.string().optional(),
      })
    ).min(1, "At least one attendance record is required"),
  }),
});

export const updateAttendanceSchema = z.object({
  body: z.object({
    status: z.enum(["Present", "Absent", "Late"]),
    remarks: z.string().min(3, "Remarks for editing attendance are required (min 3 chars)"),
  }),
});
