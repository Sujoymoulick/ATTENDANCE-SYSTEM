import { Request, Response } from "express";
import { Attendance } from "../models/Attendance";
import { AuditLog } from "../models/AuditLog";
import { Subject } from "../models/Subject";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Types } from "mongoose";

// Normalize date to YYYY-MM-DD (midnight UTC) to prevent timezone mismatch duplicates
const getNormalizedDate = (dateStr: string): Date => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    throw new ApiError(400, "Invalid date format");
  }
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
};

export const markAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { subject, date, student, status, remarks } = req.body;
  const teacherId = req.user!.id;

  const normalizedDate = getNormalizedDate(date);

  // Verify subject exists and is taught by this teacher
  const subjectObj = await Subject.findById(subject);
  if (!subjectObj) {
    throw new ApiError(404, "Subject not found");
  }
  
  if (req.user!.role !== "ADMIN" && subjectObj.teacher.toString() !== teacherId) {
    throw new ApiError(403, "You are not authorized to mark attendance for this subject");
  }

  // Double check student exists
  const studentUser = await User.findById(student);
  if (!studentUser || studentUser.role !== "STUDENT") {
    throw new ApiError(400, "Invalid student ID");
  }

  // Check duplicate
  const existing = await Attendance.findOne({ student, subject, date: normalizedDate });
  if (existing) {
    throw new ApiError(400, "Attendance already marked for this student and subject on this date");
  }

  const attendance = await Attendance.create({
    student,
    subject,
    teacher: teacherId,
    date: normalizedDate,
    status,
    remarks,
  });

  res.status(201).json(new ApiResponse(201, attendance, "Attendance marked successfully"));
});

export const bulkMarkAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { subject, date, records } = req.body; // records: Array of { student, status, remarks }
  const teacherId = req.user!.id;

  const normalizedDate = getNormalizedDate(date);

  const subjectObj = await Subject.findById(subject);
  if (!subjectObj) {
    throw new ApiError(404, "Subject not found");
  }

  if (req.user!.role !== "ADMIN" && subjectObj.teacher.toString() !== teacherId) {
    throw new ApiError(403, "You are not authorized to mark attendance for this subject");
  }

  const savedRecords = [];
  const errors = [];

  for (const record of records) {
    try {
      // Check existing
      const existing = await Attendance.findOne({
        student: record.student,
        subject,
        date: normalizedDate,
      });

      if (existing) {
        // Update instead of failing, or skip
        existing.status = record.status;
        existing.remarks = record.remarks;
        existing.teacher = new Types.ObjectId(teacherId);
        await existing.save();
        savedRecords.push(existing);
      } else {
        const newRecord = await Attendance.create({
          student: record.student,
          subject,
          teacher: teacherId,
          date: normalizedDate,
          status: record.status,
          remarks: record.remarks,
        });
        savedRecords.push(newRecord);
      }
    } catch (err: any) {
      errors.push({ student: record.student, error: err.message });
    }
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalRecords: records.length,
        successCount: savedRecords.length,
        failCount: errors.length,
        savedRecords,
        errors,
      },
      "Bulk attendance processing complete"
    )
  );
});

export const updateAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const editedBy = req.user!.id;

  const attendance = await Attendance.findById(id);
  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  const previousStatus = attendance.status;
  
  if (previousStatus === status) {
    throw new ApiError(400, `Attendance status is already '${status}'`);
  }

  attendance.status = status;
  if (remarks) attendance.remarks = remarks;
  await attendance.save();

  // Create Audit Log
  await AuditLog.create({
    attendanceId: attendance._id,
    editedBy,
    action: "UPDATE",
    previousStatus,
    newStatus: status,
    remarks: remarks || "Status updated manually",
  });

  res.status(200).json(new ApiResponse(200, attendance, "Attendance updated and log created"));
});

export const getStudentAttendance = asyncHandler(async (req: Request, res: Response) => {
  const studentId = req.user!.role === "STUDENT" ? req.user!.id : req.query.studentId;
  if (!studentId) {
    throw new ApiError(400, "Student ID is required");
  }

  // Fetch student profile details
  const student = await User.findById(studentId).select("name email department semester section rollNumber");
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // Get all attendance records
  const records = await Attendance.find({ student: studentId })
    .populate("subject", "name code")
    .populate("teacher", "name")
    .sort({ date: -1 });

  // Calculate subject-wise percentages
  const subjectsMap: any = {};
  
  // Find all subjects assigned to student's department + semester
  const availableSubjects = await Subject.find({
    department: student.department || "",
    semester: student.semester || "",
  });

  availableSubjects.forEach((sub) => {
    subjectsMap[sub._id.toString()] = {
      subjectId: sub._id,
      name: sub.name,
      code: sub.code,
      totalClasses: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
    };
  });

  // Distribute marked records
  records.forEach((record: any) => {
    const subId = record.subject._id.toString();
    
    if (!subjectsMap[subId]) {
      // Record exists for a subject not in department scope (or older semester)
      subjectsMap[subId] = {
        subjectId: record.subject._id,
        name: record.subject.name,
        code: record.subject.code,
        totalClasses: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
      };
    }

    subjectsMap[subId].totalClasses += 1;
    if (record.status === "Present") subjectsMap[subId].presentCount += 1;
    if (record.status === "Absent") subjectsMap[subId].absentCount += 1;
    if (record.status === "Late") subjectsMap[subId].lateCount += 1;
  });

  const subjectWiseStats = Object.values(subjectsMap).map((stat: any) => {
    const total = stat.totalClasses;
    const attended = stat.presentCount + stat.lateCount; // Late counts as attended
    const percentage = total > 0 ? parseFloat(((attended / total) * 100).toFixed(2)) : 100.0;
    return {
      ...stat,
      attendancePercentage: percentage,
    };
  });

  // Calculate overall percentage
  const grandTotal = records.length;
  const grandAttended = records.filter(r => r.status === "Present" || r.status === "Late").length;
  const overallPercentage = grandTotal > 0 ? parseFloat(((grandAttended / grandTotal) * 100).toFixed(2)) : 100.0;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        student,
        overallPercentage,
        grandTotal,
        grandAttended,
        subjectWiseStats,
        records,
      },
      "Student attendance dashboard data retrieved"
    )
  );
});

export const getClassAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId, date } = req.query;

  if (!subjectId || !date) {
    throw new ApiError(400, "Subject ID and Date (YYYY-MM-DD) are required");
  }

  const normalizedDate = getNormalizedDate(date as string);

  const subject = await Subject.findById(subjectId).populate("teacher", "name");
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  // Fetch all students belonging to the department and semester of this subject
  const students = await User.find({
    role: "STUDENT",
    department: subject.department,
    semester: subject.semester,
  }).select("name email rollNumber section");

  // Fetch marked attendance records for this date
  const records = await Attendance.find({
    subject: subjectId,
    date: normalizedDate,
  }).populate("student", "name rollNumber");

  const recordsMap: any = {};
  records.forEach((rec) => {
    recordsMap[rec.student._id.toString()] = rec;
  });

  // Merge so we present all students and mark status if registered
  const mergedList = students.map((stud) => {
    const record = recordsMap[stud._id.toString()];
    return {
      studentId: stud._id,
      name: stud.name,
      rollNumber: stud.rollNumber,
      section: stud.section,
      status: record ? record.status : "Not Marked",
      attendanceId: record ? record._id : null,
      remarks: record ? record.remarks : "",
    };
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        subject,
        date: normalizedDate,
        attendance: mergedList,
      },
      "Class attendance retrieved successfully"
    )
  );
});

export const getSubjectAttendanceHistory = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId } = req.query;
  if (!subjectId) {
    throw new ApiError(400, "Subject ID is required");
  }

  const subject = await Subject.findById(subjectId).populate("teacher", "name");
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  // Aggregate class sessions (unique dates where attendance was marked)
  const distinctDates = await Attendance.distinct("date", { subject: subjectId });
  distinctDates.sort((a, b) => b.getTime() - a.getTime()); // Decending order

  const history = [];

  for (const date of distinctDates) {
    const present = await Attendance.countDocuments({ subject: subjectId, date, status: "Present" });
    const absent = await Attendance.countDocuments({ subject: subjectId, date, status: "Absent" });
    const late = await Attendance.countDocuments({ subject: subjectId, date, status: "Late" });
    history.push({
      date,
      present,
      absent,
      late,
      total: present + absent + late,
    });
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        subject,
        history,
      },
      "Subject attendance history retrieved"
    )
  );
});

export const generateReports = asyncHandler(async (req: Request, res: Response) => {
  const { department, semester, subjectId, startDate, endDate, format } = req.query;

  // Build filter
  const query: any = {};
  
  if (subjectId) {
    query.subject = subjectId;
  } else if (department || semester) {
    // Need to find matching subjects
    const subQuery: any = {};
    if (department) subQuery.department = department;
    if (semester) subQuery.semester = semester;
    const subjects = await Subject.find(subQuery);
    query.subject = { $in: subjects.map(s => s._id) };
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = getNormalizedDate(startDate as string);
    if (endDate) query.date.$lte = getNormalizedDate(endDate as string);
  }

  const records = await Attendance.find(query)
    .populate("student", "name email rollNumber department semester section")
    .populate("subject", "name code department semester")
    .populate("teacher", "name")
    .sort({ date: 1, "student.name": 1 });

  if (format === "csv") {
    // Generate CSV response
    let csv = "Date,Roll Number,Student Name,Department,Semester,Section,Subject Code,Subject Name,Status,Teacher,Remarks\n";
    records.forEach((r: any) => {
      const formattedDate = new Date(r.date).toISOString().split("T")[0];
      const studName = `"${r.student.name.replace(/"/g, '""')}"`;
      const subName = `"${r.subject.name.replace(/"/g, '""')}"`;
      const teacherName = `"${r.teacher.name.replace(/"/g, '""')}"`;
      const rem = `"${(r.remarks || "").replace(/"/g, '""')}"`;
      
      csv += `${formattedDate},${r.student.rollNumber || "-"},${studName},${r.student.department || "-"},${r.student.semester || "-"},${r.student.section || "-"},${r.subject.code},${subName},${r.status},${teacherName},${rem}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=attendance_report_${Date.now()}.csv`);
    return res.status(200).send(csv);
  }

  // Otherwise, return JSON representation
  res.status(200).json(new ApiResponse(200, records, "Reports compiled successfully"));
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const totalStudents = await User.countDocuments({ role: "STUDENT" });
  const totalTeachers = await User.countDocuments({ role: "TEACHER" });
  
  const today = getNormalizedDate(new Date().toISOString());

  const todayPresent = await Attendance.countDocuments({ date: today, status: "Present" });
  const todayAbsent = await Attendance.countDocuments({ date: today, status: "Absent" });
  const todayLate = await Attendance.countDocuments({ date: today, status: "Late" });
  const todayTotal = todayPresent + todayAbsent + todayLate;

  // Monthly stats (for chart)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const monthlyStats = await Attendance.aggregate([
    { $match: { date: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] } },
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Department-wise attendance percentages
  const deptStats = await Attendance.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "student",
        foreignField: "_id",
        as: "studentInfo"
      }
    },
    { $unwind: "$studentInfo" },
    {
      $group: {
        _id: "$studentInfo.department",
        present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] } },
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalStudents,
        totalTeachers,
        todayAttendance: {
          present: todayPresent,
          absent: todayAbsent,
          late: todayLate,
          total: todayTotal,
        },
        monthlyTrends: monthlyStats,
        departmentDistribution: deptStats,
      },
      "Dashboard statistics loaded"
    )
  );
});
