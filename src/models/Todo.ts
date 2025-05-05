import mongoose, { Document, Schema } from "mongoose";

// Define priority enum
export enum Priority {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

// Define note sub-document interface
export interface INote extends Document {
  content: string;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

// Define todo document interface
export interface ITodo extends Document {
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  mentionedUsers: mongoose.Types.ObjectId[];
  notes: INote[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Create Note schema
const NoteSchema = new Schema<INote>({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

// Create Todo schema
const TodoSchema = new Schema<ITodo>({
  title: { type: String, required: true },
  description: { type: String, required: false },
  priority: {
    type: String,
    enum: Object.values(Priority),
    default: Priority.MEDIUM,
  },
  tags: [{ type: String }],
  mentionedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  notes: [NoteSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update updatedAt on save
TodoSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Todo = mongoose.model<ITodo>("Todo", TodoSchema);

export default Todo;
