import { Schema, model } from "mongoose";
import { IAuditLog } from "../types";

const auditLogSchema = new Schema<IAuditLog>(
  {
    attendanceId: { type: Schema.Types.ObjectId, ref: "Attendance", required: true, index: true },
    editedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true, default: "UPDATE" },
    previousStatus: { type: String, enum: ["Present", "Absent", "Late"] },
    newStatus: { type: String, required: true, enum: ["Present", "Absent", "Late"] },
    remarks: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
