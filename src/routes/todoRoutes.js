"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const todoController_1 = require("../controllers/todoController");
const router = express_1.default.Router();
// Todo routes
router.route("/").get(todoController_1.getTodos).post(todoController_1.createTodo);
router.route("/:id").get(todoController_1.getTodoById).put(todoController_1.updateTodo).delete(todoController_1.deleteTodo);
// Note routes
router.route("/:id/notes").get(todoController_1.getNotes).post(todoController_1.addNote);
exports.default = router;
