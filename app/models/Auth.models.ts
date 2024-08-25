import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  }, 
  { timestamps: true }
);

export const AuthModel = mongoose.model('Auth', schema);
