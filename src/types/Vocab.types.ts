import { EStatusFilter } from '../enums/VocabTrainer.enums.js';
import { TOption, TPagination, TParams, TSort } from './Global.types.js';

export type TVocabRes = {
  _id: string;
  sourceLanguage: string;
  targetLanguage: string;
  textSource: string;
  textTarget: TTextTarget[];
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

export type TExamples = {
  source: string;
  target: string;
};

export type TGetAllVocabReq = {
  search?: string;
  statusFilter: EStatusFilter[];
  subjectFilter: string[];
} & TPagination &
  TSort;

export type TRandomVocabReq = TParams & { amount: number };
export type TRandomVocabRes = { data: TVocabRes[] };

export type TAddVocabReq = Omit<TVocabRes, '_id'>;
export type TUpdateVocabReq = Partial<TAddVocabReq>;
