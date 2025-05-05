import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db";
import seedUsers from "./config/seed";

// Load environment variables
dotenv.config();

// Initialize database
const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed users
    await seedUsers();

    console.log("Database initialization completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
};

// Run initialization
initializeDatabase();
