export type TUpdateTestVocabTrainer = {
  duration: string;
  wordTestSelects: TWordTestSelect[];
};

export type TWordTestSelect = {
  idWord: string;
  userSelect: string;
};

export type TExamples = {
  source: string;
  target: string;
};

export type TTextTarget = {
  text: string;
  wordType: string;
  explanationSource: string;
  explanationTarget: string;
  examples: TExamples[];
  grammar: string;
  subject: TOption[];
};

export type TVocab = {
  _id: string;
  sourceLanguage: string;
  targetLanguage: string;
  textSource: string;
  textTarget: TTextTarget[];
};

export type TOption = {
  label: string;
  value: string;
};

export type TVocabTrainer = {
  _id: string;
  nameTest: string;
  status: string;
  duration: string;
  updatedAt: string;
  countTime: number;
  wordResults: TWordResults[];
};

export type TWordResults = {
  userSelect: string;
  systemSelect: string;
};

export type TFormInputsVocabTrainer = {
  nameTest: string;
  wordSelects: string[];
};

export type TScoreStatus = "Passed" | "Failed";
