import mongoose from "mongoose";
import { User } from "../models/User";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/attendance");
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed test accounts if database is empty
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log("No users found in database. Auto-seeding test accounts...");
        
        await User.create([
          {
            name: "System Admin",
            email: "admin@test.com",
            password: "password", // Will be hashed automatically by user pre-save hook
            role: "ADMIN",
          },
          {
            name: "John Teacher",
            email: "teacher@test.com",
            password: "password",
            role: "TEACHER",
            department: "Computer Science",
          },
          {
            name: "Alice Student",
            email: "student@test.com",
            password: "password",
            role: "STUDENT",
            department: "Computer Science",
            semester: "Semester 1",
            section: "A",
            rollNumber: "CS001",
          }
        ]);
        
        console.log("Test accounts auto-seeded successfully!");
      }
    } catch (seedError) {
      console.error("Auto-seeding test accounts failed:", seedError);
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};
