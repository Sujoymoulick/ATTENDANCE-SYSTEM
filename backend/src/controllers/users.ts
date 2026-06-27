import { Request, Response } from "express";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const search = (req.query.search as string) || "";
  const role = req.query.role as string;
  const department = req.query.department as string;
  const semester = req.query.semester as string;
  const section = req.query.section as string;
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const order = req.query.order === "asc" ? 1 : -1;

  // Build filter query
  const query: any = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { rollNumber: { $regex: search, $options: "i" } },
    ];
  }

  if (role) query.role = role;
  if (department) query.department = department;
  if (semester) query.semester = semester;
  if (section) query.section = section;

  const totalUsers = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ [sortBy]: order })
    .skip(skip)
    .limit(limit)
    .select("-password");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          totalUsers,
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          limit,
        },
      },
      "Users retrieved successfully"
    )
  );
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json(new ApiResponse(200, user, "User retrieved"));
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, department, semester, section, rollNumber } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, "Email is already taken");
  }

  if (rollNumber) {
    const rollExists = await User.findOne({ rollNumber });
    if (rollExists) {
      throw new ApiError(400, "Roll Number is already assigned");
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    department,
    semester,
    section,
    rollNumber,
  });

  const responseData = await User.findById(user._id).select("-password");
  res.status(201).json(new ApiResponse(201, responseData, "User created successfully"));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, role, department, semester, section, rollNumber } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new ApiError(400, "Email is already taken");
    }
    user.email = email;
  }

  if (rollNumber && rollNumber !== user.rollNumber) {
    const rollExists = await User.findOne({ rollNumber });
    if (rollExists) {
      throw new ApiError(400, "Roll Number is already assigned");
    }
    user.rollNumber = rollNumber;
  }

  if (name) user.name = name;
  if (role) user.role = role;
  
  // Update role-specific fields
  user.department = department ?? user.department;
  user.semester = semester ?? user.semester;
  user.section = section ?? user.section;

  await user.save();

  const responseData = await User.findById(id).select("-password");
  res.status(200).json(new ApiResponse(200, responseData, "User updated successfully"));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await User.findByIdAndDelete(id);
  res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

export const bulkUploadUsers = asyncHandler(async (req: Request, res: Response) => {
  const { csvText } = req.body; // Expect raw CSV string
  if (!csvText) {
    throw new ApiError(400, "CSV text data is required");
  }

  const lines = csvText.split(/\r?\n/).filter((line: string) => line.trim() !== "");
  if (lines.length < 2) {
    throw new ApiError(400, "CSV contains no data rows");
  }

  const headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase());
  
  const requiredHeaders = ["name", "email", "password", "role"];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new ApiError(400, `Missing required CSV headers: ${missingHeaders.join(", ")}`);
  }

  const createdUsers = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const row = lines[i].split(",").map((val: string) => val.trim());
      if (row.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      // Map row to headers
      const userObj: any = {};
      headers.forEach((header: string, index: number) => {
        userObj[header] = row[index];
      });

      // Role check
      const roleUpper = userObj.role?.toUpperCase();
      if (!["ADMIN", "TEACHER", "STUDENT"].includes(roleUpper)) {
        errors.push(`Row ${i + 1}: Invalid role "${userObj.role}". Must be ADMIN, TEACHER, or STUDENT.`);
        continue;
      }
      userObj.role = roleUpper;

      // Duplicate email check in DB
      const existing = await User.findOne({ email: userObj.email.toLowerCase() });
      if (existing) {
        errors.push(`Row ${i + 1}: Email "${userObj.email}" already exists`);
        continue;
      }

      // Roll number check in DB
      if (userObj.rollnumber) {
        const rollExisting = await User.findOne({ rollNumber: userObj.rollnumber });
        if (rollExisting) {
          errors.push(`Row ${i + 1}: Roll number "${userObj.rollnumber}" already exists`);
          continue;
        }
        userObj.rollNumber = userObj.rollnumber;
        delete userObj.rollnumber;
      }

      const created = await User.create({
        name: userObj.name,
        email: userObj.email.toLowerCase(),
        password: userObj.password,
        role: userObj.role,
        department: userObj.department || undefined,
        semester: userObj.semester || undefined,
        section: userObj.section || undefined,
        rollNumber: userObj.rollNumber || undefined
      });

      createdUsers.push({
        id: created._id,
        name: created.name,
        email: created.email,
        role: created.role
      });
    } catch (err: any) {
      errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalProcessed: lines.length - 1,
        successCount: createdUsers.length,
        failCount: errors.length,
        createdUsers,
        errors,
      },
      `${createdUsers.length} users uploaded successfully. ${errors.length} errors encountered.`
    )
  );
});
