import { EStatusFilter, EVocabTrainerType } from '../enums/VocabTrainer.enums';
import { TOption, TPagination, TSort } from './Global.types';
import { TVocabRes } from './Vocab.types';

export type TupdateTestVocabTrainer = {
  duration: string;
  wordTestSelects: TWordTestSelect[];
};

export type TWordTestSelect = {
  idWord: string;
  userSelect?: string;
  type?: EVocabTrainerType;
};

export type TVocabTrainerPopulate = {
  _id: string;
  nameTest: string;
  status?: string;
  duration: string;
  updatedAt: string;
  countTime: number;
  setCountTime: number;
  wordSelects: TVocabRes[];
  wordResults: TWordResults[];
};

export type TVocabTrainerRes = {
  _id: string;
  nameTest: string;
  status: string;
  duration: string;
  updatedAt: string;
  countTime: number;
  setCountTime: number;
  wordSelects: string[];
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
  randomOrder: number;
  type: EVocabTrainerType;
};

export type TGetQuestionsRes = {
  questions: TQuestions[];
  setCountTime: number;
};

export type TAddVocabTrainerReq = {
  nameTest: string;
  wordSelects: string[];
  setCountTime: number;
};

export type TUpdateVocabTrainerReq = {
  sourceLanguage: string;
  targetLanguage: string;
  textSource: string;
  textTarget: string;
};

export type TUpdateTestVocabTrainerReq = {
  duration: number;
  wordTestSelects: {
    randomOrder: number;
    idWord: string;
    userSelect?: string;
    type?: EVocabTrainerType;
  }[];
};
