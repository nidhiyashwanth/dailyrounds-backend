"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getNotes = exports.addNote = exports.deleteTodo = exports.updateTodo = exports.createTodo = exports.getTodoById = exports.getTodos = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Todo_1 = __importStar(require("../models/Todo"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Get all todos with pagination and filtering
// @route   GET /api/todos
// @access  Public
const getTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Build query
        let query = {};
        // Filter by tags
        if (req.query.tags) {
            const tags = req.query.tags.split(",");
            query.tags = { $in: tags };
        }
        // Filter by priority
        if (req.query.priority) {
            query.priority = req.query.priority;
        }
        // Filter by mentioned user
        if (req.query.mentionedUser) {
            query.mentionedUsers = req.query.mentionedUser;
        }
        // Filter by creator
        if (req.query.createdBy) {
            query.createdBy = req.query.createdBy;
        }
        // Sorting
        let sortBy = {};
        if (req.query.sortBy) {
            const sortField = req.query.sortBy;
            const sortOrder = req.query.order === "desc" ? -1 : 1;
            sortBy = { [sortField]: sortOrder };
        }
        else {
            // Default sort by createdAt DESC
            sortBy = { createdAt: -1 };
        }
        // Execute query
        const totalTodos = yield Todo_1.default.countDocuments(query);
        const todos = yield Todo_1.default.find(query)
            .populate("createdBy", "username name")
            .populate("mentionedUsers", "username name")
            .sort(sortBy)
            .skip(skip)
            .limit(limit)
            .select("-__v");
        // Response with pagination info
        res.status(200).json({
            success: true,
            count: todos.length,
            pagination: {
                total: totalTodos,
                page,
                pages: Math.ceil(totalTodos / limit),
                limit,
            },
            data: todos,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
});
exports.getTodos = getTodos;
// @desc    Get single todo
// @route   GET /api/todos/:id
// @access  Public
const getTodoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todo = yield Todo_1.default.findById(req.params.id)
            .populate("createdBy", "username name")
            .populate("mentionedUsers", "username name")
            .populate("notes.createdBy", "username name")
            .select("-__v");
        if (!todo) {
            res.status(404).json({
                success: false,
                error: "Todo not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: todo,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
});
exports.getTodoById = getTodoById;
// Helper function to extract mentions from text
const extractMentions = (text) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract @username mentions
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions = text.match(mentionRegex) || [];
    // Remove @ symbol and get unique usernames
    const usernames = [
        ...new Set(mentions.map((mention) => mention.substring(1))),
    ];
    // Find users by username
    const users = yield User_1.default.find({ username: { $in: usernames } });
    // Return array of user IDs with correct type
    return users.map((user) => user._id);
});
// Helper function to extract tags from text
const extractTags = (text) => {
    // Extract #tag mentions
    const tagRegex = /#([a-zA-Z0-9_]+)/g;
    const tags = text.match(tagRegex) || [];
    // Remove # symbol and get unique tags
    return [...new Set(tags.map((tag) => tag.substring(1)))];
};
// Helper function to validate user IDs
const validateUserIds = (userIds) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userIds || userIds.length === 0)
        return [];
    // Validate and convert string IDs to ObjectIds
    const validIds = userIds.filter((id) => mongoose_1.default.Types.ObjectId.isValid(id));
    // Find all valid users
    const users = yield User_1.default.find({ _id: { $in: validIds } });
    // Return array of valid user ObjectIds
    return users.map((user) => user._id);
});
// @desc    Create new todo
// @route   POST /api/todos
// @access  Public
const createTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, priority, tags: requestTags, mentionedUsers: requestMentionedUsers, notes: requestNotes, createdBy, } = req.body;
        // Validate createdBy user exists
        const user = yield User_1.default.findById(createdBy);
        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        // Extract mentioned users from description
        const mentionedUsersFromDesc = yield extractMentions(description || "");
        // Combine with mentioned users from request body if provided
        let mentionedUsers = mentionedUsersFromDesc;
        if (requestMentionedUsers && requestMentionedUsers.length > 0) {
            const validMentionedUsers = yield validateUserIds(requestMentionedUsers);
            // Combine and remove duplicates
            mentionedUsers = [
                ...new Set([...mentionedUsers, ...validMentionedUsers]),
            ];
        }
        // Extract tags from description
        const tagsFromDesc = extractTags(description || "");
        // Combine with tags from request body if provided
        const finalTags = requestTags && requestTags.length > 0
            ? [...new Set([...tagsFromDesc, ...requestTags])]
            : tagsFromDesc;
        // Process notes if provided
        let initialNotes = [];
        if (requestNotes && requestNotes.length > 0) {
            // Validate each note has valid content and createdBy
            for (const note of requestNotes) {
                if (note.content && note.createdBy) {
                    const noteUser = yield User_1.default.findById(note.createdBy);
                    if (noteUser) {
                        initialNotes.push({
                            content: note.content,
                            createdBy: note.createdBy,
                            createdAt: note.createdAt || new Date(),
                        });
                    }
                }
            }
        }
        // Create todo
        const todo = yield Todo_1.default.create({
            title,
            description,
            priority: priority || Todo_1.Priority.MEDIUM,
            tags: finalTags,
            mentionedUsers,
            notes: initialNotes,
            createdBy,
        });
        // Populate references for response
        const populatedTodo = yield Todo_1.default.findById(todo._id)
            .populate("createdBy", "username name")
            .populate("mentionedUsers", "username name")
            .populate("notes.createdBy", "username name");
        res.status(201).json({
            success: true,
            data: populatedTodo,
        });
    }
    catch (error) {
        console.error("Create todo error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
});
exports.createTodo = createTodo;
// @desc    Update todo
// @route   PUT /api/todos/:id
// @access  Public
const updateTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, priority, tags: requestTags, mentionedUsers: requestMentionedUsers, } = req.body;
        // Find todo
        let todo = yield Todo_1.default.findById(req.params.id);
        if (!todo) {
            res.status(404).json({
                success: false,
                error: "Todo not found",
            });
            return;
        }
        // Process mentioned users
        let mentionedUsers = todo.mentionedUsers;
        // If mentionedUsers provided in request, validate and use them
        if (requestMentionedUsers && requestMentionedUsers.length > 0) {
            mentionedUsers = yield validateUserIds(requestMentionedUsers);
        }
        // Otherwise if description changed, extract mentions from description
        else if (description && description !== todo.description) {
            mentionedUsers = yield extractMentions(description);
        }
        // Process tags
        let finalTags = todo.tags;
        // If tags provided in request, use them
        if (requestTags && Array.isArray(requestTags)) {
            finalTags = requestTags;
        }
        // Otherwise if description changed, extract tags from description
        else if (description && description !== todo.description) {
            finalTags = extractTags(description);
        }
        // Update todo
        todo = yield Todo_1.default.findByIdAndUpdate(req.params.id, {
            title: title || todo.title,
            description: description || todo.description,
            priority: priority || todo.priority,
            tags: finalTags,
            mentionedUsers,
        }, { new: true, runValidators: true })
            .populate("createdBy", "username name")
            .populate("mentionedUsers", "username name")
            .populate("notes.createdBy", "username name");
        res.status(200).json({
            success: true,
            data: todo,
        });
    }
    catch (error) {
        console.error("Update todo error:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
});
exports.updateTodo = updateTodo;
// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Public
const deleteTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todo = yield Todo_1.default.findById(req.params.id);
        if (!todo) {
            res.status(404).json({
                success: false,
                error: "Todo not found",
            });
            return;
        }
        yield todo.deleteOne();
        res.status(200).json({
            success: true,
            data: {},
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
});
exports.deleteTodo = deleteTodo;
// @desc    Add note to todo
// @route   POST /api/todos/:id/notes
// @access  Public
const addNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content, createdBy } = req.body;
        // Validate user exists
        const user = yield User_1.default.findById(createdBy);
        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        // Find todo
        const todo = yield Todo_1.default.findById(req.params.id);
        if (!todo) {
            res.status(404).json({
                success: false,
                error: "Todo not found",
            });
            return;
        }
        // Add note to todo
        todo.notes.push({
            content,
            createdBy,
            createdAt: new Date(),
        });
        yield todo.save();
        // Get the updated todo with populated references
        const updatedTodo = yield Todo_1.default.findById(req.params.id)
            .populate("createdBy", "username name")
            .populate("mentionedUsers", "username name")
            .populate("notes.createdBy", "username name");
        res.status(200).json({
            success: true,
            data: updatedTodo,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
});
exports.addNote = addNote;
// @desc    Get notes for a todo
// @route   GET /api/todos/:id/notes
// @access  Public
const getNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todo = yield Todo_1.default.findById(req.params.id)
            .populate("notes.createdBy", "username name")
            .select("notes");
        if (!todo) {
            res.status(404).json({
                success: false,
                error: "Todo not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            count: todo.notes.length,
            data: todo.notes,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
});
exports.getNotes = getNotes;
