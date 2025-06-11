import { Request, Response } from 'express';
import { TUserInfoToken } from './User.types';

export type TOption = {
  label: string;
  value: string;
};

export type TPagination = {
  page?: number;
  limit?: number;
};

export type TSort = {
  sortBy?: string;
  orderBy?: string;
};

export type TDataPaginationRes<T> = {
  data: T;
  totalPages: number;
  currentPage: number;
  totalItems: number;
};

export type TRequest<TParams = {}, TBody = {}, TQuery = {}> = Request<
  TParams,
  {},
  TBody,
  TQuery
>;

export type TRequestWithUser<TParams = {}, TBody = {}, TQuery = {}> = TRequest<
  TParams,
  TBody,
  TQuery
> & {
  user: TUserInfoToken;
};

export type TResponse<T> = Response<TDataPaginationRes<T>>;
export type TParams = {
  id: string;
};

export enum EActionSocket {
  DELETED = 'deleted',
  CREATED = 'created',
  UPDATED = 'updated',
  MULTI_DELETED = 'multi-deleted',
  MULTI_CREATED = 'multi-created',
}

export enum ETypeSocket {
  VOCAB = 'vocab',
  COMMENT = 'comment',
  VOCAB_TRAINER = 'vocab-trainer',
  VOCAB_SUBJECT = 'vocab-subject',
  SYSTEM = 'system',
}

export enum EEmitSocket {
  VOCAB_NOTIFICATION = 'vocab-notification',
  COMMENT_NOTIFICATION = 'comment-notification',
  VOCAB_TRAINER_NOTIFICATION = 'vocab-trainer-notification',
  VOCAB_SUBJECT_NOTIFICATION = 'vocab-subject-notification',
  SYSTEM_NOTIFICATION = 'system-notification',
}
