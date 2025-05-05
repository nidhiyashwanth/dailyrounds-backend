import mongoose, { Document, Schema } from "mongoose";

// Define user document interface
export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create User schema
const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update updatedAt on save
UserSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
