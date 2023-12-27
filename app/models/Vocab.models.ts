import mongoose from 'mongoose';

// define type children schema in array
const itemTextTarget = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  wordType: {
    type: String,
    required: true,
  },
  explanationSource: {
    type: String,
    required: true,
  },
  explanationTarget: {
    type: String,
    required: true,
  },
  exampleSource: {
    type: String,
    required: true,
  },
  exampleTarget: {
    type: String,
    required: true,
  },
  grammar: {
    type: String,
  },
  subject: {
    type: String,
    required: true,
  },
});

const schema = new mongoose.Schema(
  {
    sourceLanguage: {
      type: String,
      required: true,
    },
    targetLanguage: {
      type: String,
      required: true,
    },
    textSource: {
      type: String,
      required: true,
    },
    textTarget: {
      type: [itemTextTarget],
      required: true,
    },
  },
  { timestamps: true }
);

export const VocabModel = mongoose.model('Vocab', schema);