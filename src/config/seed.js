"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const db_1 = __importDefault(require("./db"));
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
const seedUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        yield (0, db_1.default)();
        // Check if users already exist
        const existingUsersCount = yield User_1.default.countDocuments();
        if (existingUsersCount > 0) {
            console.log(`Database already has ${existingUsersCount} users. Skipping seed.`);
            return;
        }
        // Create users
        const createdUsers = yield User_1.default.create(users);
        console.log(`Created ${createdUsers.length} users:`);
        createdUsers.forEach((user) => {
            console.log(`- ${user.name} (${user.username})`);
        });
    }
    catch (error) {
        console.error("Error seeding database:", error);
    }
    finally {
        // Close the connection
        mongoose_1.default.connection.close();
    }
});
exports.seedUsers = seedUsers;
// Run the seed function if this file is executed directly
if (require.main === module) {
    (0, exports.seedUsers)()
        .then(() => {
        console.log("Seed completed successfully");
        process.exit(0);
    })
        .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    });
}
exports.default = exports.seedUsers;
