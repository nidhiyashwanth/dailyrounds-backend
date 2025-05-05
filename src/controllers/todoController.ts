import { Request, Response } from "express";
import mongoose from "mongoose";
import Todo, { ITodo, Priority } from "../models/Todo";
import User from "../models/User";

// @desc    Get all todos with pagination and filtering
// @route   GET /api/todos
// @access  Public
export const getTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query: any = {};

    // Filter by tags
    if (req.query.tags) {
      const tags = (req.query.tags as string).split(",");
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
      const sortField = req.query.sortBy as string;
      const sortOrder = req.query.order === "desc" ? -1 : 1;
      sortBy = { [sortField]: sortOrder };
    } else {
      // Default sort by createdAt DESC
      sortBy = { createdAt: -1 };
    }

    // Execute query
    const totalTodos = await Todo.countDocuments(query);
    const todos = await Todo.find(query)
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get single todo
// @route   GET /api/todos/:id
// @access  Public
export const getTodoById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const todo = await Todo.findById(req.params.id)
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Helper function to extract mentions from text
const extractMentions = async (
  text: string
): Promise<mongoose.Types.ObjectId[]> => {
  // Extract @username mentions
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentions = text.match(mentionRegex) || [];

  // Remove @ symbol and get unique usernames
  const usernames = [
    ...new Set(mentions.map((mention) => mention.substring(1))),
  ];

  // Find users by username
  const users = await User.find({ username: { $in: usernames } });

  // Return array of user IDs with correct type
  return users.map((user) => user._id) as mongoose.Types.ObjectId[];
};

// Helper function to extract tags from text
const extractTags = (text: string): string[] => {
  // Extract #tag mentions
  const tagRegex = /#([a-zA-Z0-9_]+)/g;
  const tags = text.match(tagRegex) || [];

  // Remove # symbol and get unique tags
  return [...new Set(tags.map((tag) => tag.substring(1)))];
};

// Helper function to validate user IDs
const validateUserIds = async (
  userIds: string[]
): Promise<mongoose.Types.ObjectId[]> => {
  if (!userIds || userIds.length === 0) return [];

  // Validate and convert string IDs to ObjectIds
  const validIds = userIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  // Find all valid users
  const users = await User.find({ _id: { $in: validIds } });

  // Return array of valid user ObjectIds
  return users.map((user) => user._id) as mongoose.Types.ObjectId[];
};

// @desc    Create new todo
// @route   POST /api/todos
// @access  Public
export const createTodo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      priority,
      tags: requestTags,
      mentionedUsers: requestMentionedUsers,
      notes: requestNotes,
      createdBy,
    } = req.body;

    // Validate createdBy user exists
    const user = await User.findById(createdBy);
    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Extract mentioned users from description
    const mentionedUsersFromDesc = await extractMentions(description || "");

    // Combine with mentioned users from request body if provided
    let mentionedUsers = mentionedUsersFromDesc;
    if (requestMentionedUsers && requestMentionedUsers.length > 0) {
      const validMentionedUsers = await validateUserIds(requestMentionedUsers);
      // Combine and remove duplicates
      mentionedUsers = [
        ...new Set([...mentionedUsers, ...validMentionedUsers]),
      ];
    }

    // Extract tags from description
    const tagsFromDesc = extractTags(description || "");

    // Combine with tags from request body if provided
    const finalTags =
      requestTags && requestTags.length > 0
        ? [...new Set([...tagsFromDesc, ...requestTags])]
        : tagsFromDesc;

    // Process notes if provided
    let initialNotes = [];
    if (requestNotes && requestNotes.length > 0) {
      // Validate each note has valid content and createdBy
      for (const note of requestNotes) {
        if (note.content && note.createdBy) {
          const noteUser = await User.findById(note.createdBy);
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
    const todo = await Todo.create({
      title,
      description,
      priority: priority || Priority.MEDIUM,
      tags: finalTags,
      mentionedUsers,
      notes: initialNotes,
      createdBy,
    });

    // Populate references for response
    const populatedTodo = await Todo.findById(todo._id)
      .populate("createdBy", "username name")
      .populate("mentionedUsers", "username name")
      .populate("notes.createdBy", "username name");

    res.status(201).json({
      success: true,
      data: populatedTodo,
    });
  } catch (error) {
    console.error("Create todo error:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update todo
// @route   PUT /api/todos/:id
// @access  Public
export const updateTodo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      priority,
      tags: requestTags,
      mentionedUsers: requestMentionedUsers,
    } = req.body;

    // Find todo
    let todo = await Todo.findById(req.params.id);

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
      mentionedUsers = await validateUserIds(requestMentionedUsers);
    }
    // Otherwise if description changed, extract mentions from description
    else if (description && description !== todo.description) {
      mentionedUsers = await extractMentions(description);
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
    todo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        title: title || todo.title,
        description: description || todo.description,
        priority: priority || todo.priority,
        tags: finalTags,
        mentionedUsers,
      },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "username name")
      .populate("mentionedUsers", "username name")
      .populate("notes.createdBy", "username name");

    res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    console.error("Update todo error:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Public
export const deleteTodo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      res.status(404).json({
        success: false,
        error: "Todo not found",
      });
      return;
    }

    await todo.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Add note to todo
// @route   POST /api/todos/:id/notes
// @access  Public
export const addNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, createdBy } = req.body;

    // Validate user exists
    const user = await User.findById(createdBy);
    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Find todo
    const todo = await Todo.findById(req.params.id);

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
    } as any);

    await todo.save();

    // Get the updated todo with populated references
    const updatedTodo = await Todo.findById(req.params.id)
      .populate("createdBy", "username name")
      .populate("mentionedUsers", "username name")
      .populate("notes.createdBy", "username name");

    res.status(200).json({
      success: true,
      data: updatedTodo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get notes for a todo
// @route   GET /api/todos/:id/notes
// @access  Public
export const getNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const todo = await Todo.findById(req.params.id)
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
