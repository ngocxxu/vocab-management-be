import { Request, Response } from "express";
import { handleError, searchRegex } from "../utils/index";
import { VocabTrainerModel } from "../models/VocabTrainer.models";
import { SortOrder } from "mongoose";

export const getAllVocabTrainer = async (req: Request, res: Response) => {
  try {
    const result = await VocabTrainerModel.find().populate("wordSelects");

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const getVocabTrainer = async (req: Request, res: Response) => {
  try {
    const result = await VocabTrainerModel.findById({
      _id: req.params.id,
    }).sort({
      createdAt: -1,
    });
    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const addVocabTrainer = async (req: Request, res: Response) => {
  try {
    const result = new VocabTrainerModel({
      nameTest: req.body.nameTest,
      wordSelects: req.body.wordSelects,
    }).save();

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const updateVocabTrainer = async (req: Request, res: Response) => {
  try {
    const result = await VocabTrainerModel.findByIdAndUpdate(req.params.id, {
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

export const updateTestVocabTrainer = async (req: Request, res: Response) => {
  try {
    const result = await VocabTrainerModel.findByIdAndUpdate(req.params.id, {
      duration: req.body.duration,
      status: "",
      countTime: { $inc: 1 }, // Increment countTime by 1
      wordResults: [],
    });

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const removeVocabTrainer = async (req: Request, res: Response) => {
  try {
    const result = await VocabTrainerModel.findByIdAndDelete(req.params.id);

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const removeMultiVocabTrainer = async (req: Request, res: Response) => {
  try {
    const result = await VocabTrainerModel.deleteMany({
      _id: { $in: req.body },
    });

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};
