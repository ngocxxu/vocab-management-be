import { Request, Response } from 'express';

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

export type TRequest<T> = Request<{}, {}, {}, T>;
export type TResponse<T> = Response<TDataPaginationRes<T>>;
