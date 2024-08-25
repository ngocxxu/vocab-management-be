import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: String,
  },
  { timestamps: true }
);

export const UserModel = mongoose.model('User', schema);
