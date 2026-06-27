import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";

// Load Environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });

  // Handle Unhandled Rejections
  process.on("unhandledRejection", (err: any) => {
    console.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
});

// Handle Uncaught Exceptions
process.on("uncaughtException", (err: any) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
