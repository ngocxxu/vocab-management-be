import { Request, Response } from 'express';
import { handleError } from '../utils/index.ts';
import { VocabModel } from '../models/Vocab.models.ts';

export const getAllVocab = async (req: Request, res: Response) => {
  try {
    const result = await VocabModel.find();

    res.status(200).json(result);
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
