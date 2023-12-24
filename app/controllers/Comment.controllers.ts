import { Request, Response } from 'express';
import { CommentModel } from '../models/Comment.models.ts';
import { handleError } from '../utils/index.ts';

export const getAllComment = async (req: Request, res: Response) => {
  try {
    const result = await CommentModel.find()
      .select('-product -_id -__v')
      .populate('userId');

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const getComment = async (req: Request, res: Response) => {
  try {
    const result = await CommentModel.find({ product: req.params.id })
      .sort({ createdAt: -1 })
      .select('-product -_id -__v')
      .populate('userId');
    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const addToComment = async (req: Request, res: Response) => {
  try {
    const result = new CommentModel({
      userId: req.body.id,
      product: req.body.idProduct,
      content: req.body.content,
      rate: req.body.rate,
    }).save();

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const updateToComment = async (req: Request, res: Response) => {
  try {
    const result = await CommentModel.findByIdAndUpdate(req.params.id, {
      content: req.body.content,
      rate: req.body.rate,
    });

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const removeToComment = async (req: Request, res: Response) => {
  try {
    const result = await CommentModel.findByIdAndDelete(req.params.id);

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};
