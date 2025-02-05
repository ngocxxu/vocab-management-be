import { ObjectId } from 'mongoose';

export type TVocabSubject = {
  _id: string | ObjectId;
  name: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
};
