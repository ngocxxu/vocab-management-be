import { Document } from 'mongoose';
import { EStatusFilter, EVocabTrainerType } from '../enums/VocabTrainer.enums';
import { TPagination, TSort } from './Global.types';

export type TupdateTestVocabTrainer = {
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
  status: string;
};

export type TFormInputsVocabTrainer = {
  nameTest: string;
  wordSelects: string[];
};

export type TScoreStatus = 'Passed' | 'Failed';

export type TGetAllVocabTrainerReq = {
  search?: string;
  statusFilter: EStatusFilter[];
} & TPagination &
  TSort;

export type TGetVocabTrainerReq = {
  id: string;
};

export type TQuestions = {
  content: string[];
  options: TOption[];
  order: number;
  type: EVocabTrainerType;
};

export type TGetQuestionsRes = {
  questions: TQuestions[];
  setCountTime: number;
};
