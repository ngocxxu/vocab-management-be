import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    order: {
      type: Number,
      require: true,
    },
  },
  { timestamps: true }
);

export const VocabSubjectModel = mongoose.model('VocabSubject', schema);
