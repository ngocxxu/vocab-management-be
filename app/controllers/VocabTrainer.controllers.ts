import { ObjectId, ObjectIdLike } from "bson";
import { Request, Response } from "express";
import { VocabTrainerModel } from "../models/VocabTrainer.models";
import { TWordResults, TWordTestSelect } from "../types/VocabTrainer.types";
import { handleError } from "../utils/index";

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
    const { wordTestSelects } = req.body;
    const item = await VocabTrainerModel.findById(req.params.id).populate(
      "wordSelects"
    );

    // Calculation score
    const newWordResults = (item.wordSelects as any).map(
      (word: { _id: string | ObjectId | ObjectIdLike; textSource: any }) => {
        const itemB = wordTestSelects.find(
          (item: TWordTestSelect) => item.idWord === word._id.toString()
        );
        if (itemB)
          return {
            userSelect: itemB.userSelect,
            systemSelect: word.textSource,
          };
      }
    );
    const countCorrectResults = newWordResults.filter(
      (item: TWordResults) => item.userSelect === item.systemSelect
    ).length;
    const totalResults = newWordResults.length;
    const statusResult =
      countCorrectResults / totalResults > 0.7 ? "Passed" : "Failed";

    const result = await VocabTrainerModel.findByIdAndUpdate(req.params.id, {
      $set: {
        duration: req.body.duration,
        status: statusResult,
        wordResults: newWordResults,
      },
      $inc: {
        countTime: 1,
      },
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
