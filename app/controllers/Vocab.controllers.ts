import { Request, Response } from 'express';
import { handleError } from '../utils/index';
import { VocabModel } from '../models/Vocab.models';

export const getAllVocab = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Chuyển đổi page và limit sang kiểu số
    const pageNumber: number = parseInt(page as string, 10);
    const limitNumber: number = parseInt(limit as string, 10);

    // Kiểm tra nếu pageNumber không phải là số
    if (isNaN(pageNumber)) {
      throw new Error('Invalid page number');
    }

    const skip = (pageNumber - 1) * limitNumber;

    const data = await VocabModel.find().skip(skip).limit(limitNumber);
    const totalCount = await VocabModel.countDocuments();
    const totalPages = Math.ceil(totalCount / limitNumber);

    res.status(200).json({
      data,
      totalPages,
      currentPage: pageNumber,
      totalItems: totalCount,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const getVocab = async (req: Request, res: Response) => {
  try {
    const result = await VocabModel.findById({ _id: req.params.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const addVocab = async (req: Request, res: Response) => {
  try {
    const result = new VocabModel({
      sourceLanguage: req.body.sourceLanguage,
      targetLanguage: req.body.targetLanguage,
      textSource: req.body.textSource,
      textTarget: req.body.textTarget,
    }).save();

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const updateVocab = async (req: Request, res: Response) => {
  try {
    const result = await VocabModel.findByIdAndUpdate(req.params.id, {
      sourceLanguage: req.body.sourceLanguage,
      targetLanguage: req.body.targetLanguage,
      textSource: req.body.textSource,
      textTarget: req.body.textTarget,
    });

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const removeVocab = async (req: Request, res: Response) => {
  try {
    const result = await VocabModel.findByIdAndDelete(req.params.id);

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};
