"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
// User routes
router.route("/").get(userController_1.getUsers).post(userController_1.createUser);
router.route("/:id").get(userController_1.getUserById);
exports.default = router;
