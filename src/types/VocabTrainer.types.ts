import { EStatusFilter, EVocabTrainerType } from '../enums/VocabTrainer.enums.js';
import { TOption, TPagination, TSort } from './Global.types.js';
import { TVocabRes } from './Vocab.types.js';

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

export type TVocabRemiderRes = {
  _id: string;
  vocabTrainer: TVocabTrainerRes;
  disabled: boolean;
  repeat: number;
  lastRemind: Date
}

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
  nameTest: string;
  questions: TQuestions[];
  setCountTime: number;
  message?:string
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
