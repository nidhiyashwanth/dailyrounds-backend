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
exports.createUser = exports.getUserById = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find().select("-__v");
        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
});
exports.getUsers = getUsers;
// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id).select("-__v");
        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
});
exports.getUserById = getUserById;
// @desc    Create new user
// @route   POST /api/users
// @access  Public
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, name, email } = req.body;
        // Check if user already exists
        const existingUser = yield User_1.default.findOne({
            $or: [{ username }, { email }],
        });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: "User with that username or email already exists",
            });
            return;
        }
        const user = yield User_1.default.create({
            username,
            name,
            email,
        });
        res.status(201).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
});
exports.createUser = createUser;
