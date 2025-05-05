import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
} from "../controllers/userController";

const router = express.Router();

// User routes
router.route("/").get(getUsers).post(createUser);

router.route("/:id").get(getUserById);

export default router;
