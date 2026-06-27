import { Schema, model } from "mongoose";
import { IAttendance } from "../types";

const attendanceSchema = new Schema<IAttendance>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true }, // Normalized date (YYYY-MM-DD)
    status: { type: String, required: true, enum: ["Present", "Absent", "Late"] },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

// Unique compound index: student, subject, and normalized date
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

export const Attendance = model<IAttendance>("Attendance", attendanceSchema);
