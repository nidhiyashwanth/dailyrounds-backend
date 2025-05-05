import express from "express";
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  addNote,
  getNotes,
} from "../controllers/todoController";

const router = express.Router();

// Todo routes
router.route("/").get(getTodos).post(createTodo);

router.route("/:id").get(getTodoById).put(updateTodo).delete(deleteTodo);

// Note routes
router.route("/:id/notes").get(getNotes).post(addNote);

export default router;
