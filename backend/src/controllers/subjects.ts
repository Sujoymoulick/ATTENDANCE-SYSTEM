import { Request, Response } from "express";
import { Subject } from "../models/Subject";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getSubjects = asyncHandler(async (req: Request, res: Response) => {
  const department = req.query.department as string;
  const semester = req.query.semester as string;
  const teacher = req.query.teacher as string;

  const query: any = {};
  if (department) query.department = department;
  if (semester) query.semester = semester;
  if (teacher) query.teacher = teacher;

  const subjects = await Subject.find(query).populate("teacher", "name email role");

  res.status(200).json(new ApiResponse(200, subjects, "Subjects retrieved successfully"));
});

export const getSubjectById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const subject = await Subject.findById(id).populate("teacher", "name email role");
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }
  res.status(200).json(new ApiResponse(200, subject, "Subject retrieved"));
});

export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const { name, code, teacher, semester, department } = req.body;

  // Check if subject code already exists
  const codeExists = await Subject.findOne({ code: code.toUpperCase() });
  if (codeExists) {
    throw new ApiError(400, `Subject code "${code}" is already in use`);
  }

  // Verify teacher exists and has TEACHER role
  const teacherUser = await User.findById(teacher);
  if (!teacherUser || teacherUser.role !== "TEACHER") {
    throw new ApiError(400, "Assigned teacher must be a valid user with TEACHER role");
  }

  const subject = await Subject.create({
    name,
    code: code.toUpperCase(),
    teacher,
    semester,
    department,
  });

  const responseData = await Subject.findById(subject._id).populate("teacher", "name email");
  res.status(201).json(new ApiResponse(201, responseData, "Subject created successfully"));
});

export const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, code, teacher, semester, department } = req.body;

  const subject = await Subject.findById(id);
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  if (code && code.toUpperCase() !== subject.code) {
    const codeExists = await Subject.findOne({ code: code.toUpperCase() });
    if (codeExists) {
      throw new ApiError(400, `Subject code "${code}" is already in use`);
    }
    subject.code = code.toUpperCase();
  }

  if (teacher) {
    const teacherUser = await User.findById(teacher);
    if (!teacherUser || teacherUser.role !== "TEACHER") {
      throw new ApiError(400, "Assigned teacher must be a valid user with TEACHER role");
    }
    subject.teacher = teacher;
  }

  if (name) subject.name = name;
  if (semester) subject.semester = semester;
  if (department) subject.department = department;

  await subject.save();

  const responseData = await Subject.findById(id).populate("teacher", "name email");
  res.status(200).json(new ApiResponse(200, responseData, "Subject updated successfully"));
});

export const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const subject = await Subject.findById(id);
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  await Subject.findByIdAndDelete(id);
  res.status(200).json(new ApiResponse(200, null, "Subject deleted successfully"));
});
