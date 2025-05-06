import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// MongoDB connection URI
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://dailyrounds:nZFe0oiljDPVUKw8@dailyrounds-todo.edmfvbm.mongodb.net/dailyrounds";

// Connect to MongoDB
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
