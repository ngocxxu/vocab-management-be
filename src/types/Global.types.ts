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
