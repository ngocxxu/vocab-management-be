import mongoose from 'mongoose';

const itemWordResult = new mongoose.Schema({
  userSelect: {
    type: String,
  },
  systemSelect: {
    type: String,
  },
  status: {
    type: String,
  },
});

const schema = new mongoose.Schema(
  {
    nameTest: {
      type: String,
    },
    wordSelects: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Vocab',
    },
    statusTest: {
      type: String,
      default: 'Pending',
    },
    duration: {
      type: Number,
      default: 0,
    },
    countTime: {
      type: Number,
      default: 0,
    },
    setCountTime: {
      type: Number,
      default: 300,
    },
    wordResults: {
      type: [itemWordResult],
    },
  },
  { timestamps: true }
);

export const VocabTrainerModel = mongoose.model('VocabTrainer', schema);
