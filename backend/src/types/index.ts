import { Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  department?: string;
  semester?: string;
  section?: string;
  rollNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

export interface ISubject extends Document {
  name: string;
  code: string;
  teacher: Types.ObjectId | IUser;
  semester: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendance extends Document {
  student: Types.ObjectId | IUser;
  subject: Types.ObjectId | ISubject;
  teacher: Types.ObjectId | IUser;
  date: Date;
  status: "Present" | "Absent" | "Late";
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog extends Document {
  attendanceId: Types.ObjectId | IAttendance;
  editedBy: Types.ObjectId | IUser;
  action: string; // e.g. "UPDATE"
  previousStatus?: "Present" | "Absent" | "Late";
  newStatus: "Present" | "Absent" | "Late";
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extend Express Request type to include user details after authentication
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "ADMIN" | "TEACHER" | "STUDENT";
        name: string;
      };
    }
  }
}
