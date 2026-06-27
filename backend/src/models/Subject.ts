import { Schema, model } from "mongoose";
import { ISubject } from "../types";

const subjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    semester: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Subject = model<ISubject>("Subject", subjectSchema);
