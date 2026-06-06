import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    apiKey: {
      type: String,
      default: null,
    },
    preferredModel: {
      type: String,
      default: 'mistralai/mistral-7b-instruct',
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
