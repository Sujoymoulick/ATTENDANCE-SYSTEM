import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Subject } from "../models/Subject";
import { Attendance } from "../models/Attendance";
import { AuditLog } from "../models/AuditLog";

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/attendance";
    console.log("Connecting to MongoDB at:", mongoUri);
    await mongoose.connect(mongoUri);

    console.log("Clearing existing collections...");
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Attendance.deleteMany({});
    await AuditLog.deleteMany({});

    console.log("Creating Admin user...");
    const admin = await User.create({
      name: "System Admin",
      email: "admin@test.com",
      password: "password", // Will be hashed automatically by user pre-save hook
      role: "ADMIN",
    });

    console.log("Creating Teachers...");
    const teacher1 = await User.create({
      name: "John Teacher",
      email: "teacher@test.com",
      password: "password",
      role: "TEACHER",
      department: "Computer Science",
    });

    const teacher2 = await User.create({
      name: "Sarah Teacher",
      email: "teacher2@test.com",
      password: "password",
      role: "TEACHER",
      department: "Mathematics",
    });

    console.log("Creating Students...");
    const studentsData = [
      {
        name: "Alice Student",
        email: "student@test.com",
        password: "password",
        role: "STUDENT",
        department: "Computer Science",
        semester: "Semester 1",
        section: "A",
        rollNumber: "CS001",
      },
      {
        name: "Bob Student",
        email: "student2@test.com",
        password: "password",
        role: "STUDENT",
        department: "Computer Science",
        semester: "Semester 1",
        section: "A",
        rollNumber: "CS002",
      },
      {
        name: "Charlie Student",
        email: "student3@test.com",
        password: "password",
        role: "STUDENT",
        department: "Computer Science",
        semester: "Semester 1",
        section: "A",
        rollNumber: "CS003",
      },
      {
        name: "David Student",
        email: "student4@test.com",
        password: "password",
        role: "STUDENT",
        department: "Computer Science",
        semester: "Semester 1",
        section: "A",
        rollNumber: "CS004",
      },
      {
        name: "Emma Student",
        email: "student5@test.com",
        password: "password",
        role: "STUDENT",
        department: "Computer Science",
        semester: "Semester 1",
        section: "A",
        rollNumber: "CS005",
      },
    ];

    const students = await User.create(studentsData);

    console.log("Creating Subjects...");
    const subject1 = await Subject.create({
      name: "Programming in C++",
      code: "CS101",
      teacher: teacher1._id,
      semester: "Semester 1",
      department: "Computer Science",
    });

    const subject2 = await Subject.create({
      name: "Calculus I",
      code: "MATH101",
      teacher: teacher2._id,
      semester: "Semester 1",
      department: "Computer Science",
    });

    console.log("Creating Mock Attendance history...");
    const pastDates = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      pastDates.push(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)));
    }

    const statuses = ["Present", "Absent", "Late"];
    
    // Seed some attendance records for past days
    for (const date of pastDates) {
      for (const student of students) {
        // Random status
        const randStatus1 = statuses[Math.floor(Math.random() * statuses.length)] as "Present" | "Absent" | "Late";
        const randStatus2 = statuses[Math.floor(Math.random() * statuses.length)] as "Present" | "Absent" | "Late";

        await Attendance.create({
          student: student._id,
          subject: subject1._id,
          teacher: teacher1._id,
          date,
          status: randStatus1,
          remarks: randStatus1 === "Late" ? "Bus delayed" : "",
        });

        await Attendance.create({
          student: student._id,
          subject: subject2._id,
          teacher: teacher2._id,
          date,
          status: randStatus2,
          remarks: randStatus2 === "Absent" ? "Unwell" : "",
        });
      }
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
