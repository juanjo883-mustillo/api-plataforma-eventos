import mongoose from 'mongoose';
import { USER_ROLES } from '../utils/constants.js';

const COLLECTION = 'users';

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user',
    },
  },
  { timestamps: true, collection: COLLECTION }
);

export const UserModel = mongoose.model('User', userSchema);
