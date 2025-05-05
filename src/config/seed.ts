import mongoose from "mongoose";
import User from "../models/User";
import connectDB from "./db";

// Predefined users to create
const users = [
  {
    username: "johndoe",
    name: "John Doe",
    email: "john.doe@example.com",
  },
  {
    username: "janedoe",
    name: "Jane Doe",
    email: "jane.doe@example.com",
  },
  {
    username: "bobsmith",
    name: "Bob Smith",
    email: "bob.smith@example.com",
  },
  {
    username: "alicejones",
    name: "Alice Jones",
    email: "alice.jones@example.com",
  },
  {
    username: "mikebrown",
    name: "Mike Brown",
    email: "mike.brown@example.com",
  },
];

// Seed function to create predefined users
export const seedUsers = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Check if users already exist
    const existingUsersCount = await User.countDocuments();

    if (existingUsersCount > 0) {
      console.log(
        `Database already has ${existingUsersCount} users. Skipping seed.`
      );
      return;
    }

    // Create users
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users:`);
    createdUsers.forEach((user) => {
      console.log(`- ${user.name} (${user.username})`);
    });
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log("Seed completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}

export default seedUsers;
