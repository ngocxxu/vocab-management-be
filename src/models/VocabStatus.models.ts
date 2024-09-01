import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    idVocab: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  { timestamps: true }
);

export const VocabStatusModel = mongoose.model("VocabStatus", schema);
