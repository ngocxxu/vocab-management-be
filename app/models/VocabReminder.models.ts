import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    vocabTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VocabTrainer',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    repeat: {
      type: Number,
      default: 2
    },
    lastRemind: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

export const VocabReminderModel = mongoose.model('VocabReminder', schema);
