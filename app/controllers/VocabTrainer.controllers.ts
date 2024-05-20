import { ObjectId, ObjectIdLike } from 'bson';
import { Request, Response } from 'express';
import { VocabTrainerModel } from '../models/VocabTrainer.models';
import { TWordResults, TWordTestSelect } from '../types/VocabTrainer.types';
import { handleError, searchRegex } from '../utils/index';
import { VocabStatusModel } from '../models/VocabStatus.models';
import { SortOrder } from 'mongoose';

export const getAllVocabTrainer = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'updatedAt',
      orderBy = 'desc',
      statusFilter = [],
    } = req.query;
    let statusFilterCustom = statusFilter;

    // Convert page & limit to number
    const pageNumber: number = parseInt(String(page), 10);
    const limitNumber: number = parseInt(String(limit), 10);

    // Check validation
    if (isNaN(pageNumber)) {
      throw new Error('Invalid page number');
    }
    if (typeof statusFilter === 'string') {
      statusFilterCustom = [statusFilter];
    }

    const isExist = search || (statusFilterCustom as string[]).length < 3;

    const skip = (pageNumber - 1) * limitNumber;

    const querySearch = {
      $or: [
        { nameTest: searchRegex(String(search)) },
        {
          statusTest: { $in: statusFilterCustom },
        },
      ],
    };

    const data = await VocabTrainerModel.find(isExist ? querySearch : {})
      .skip(skip)
      .limit(limitNumber)
      .sort([[`${sortBy}`, orderBy as SortOrder]]);

    const totalCount = isExist
      ? data.length
      : await VocabTrainerModel.countDocuments();
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

export const submitTestVocabTrainer = async (req: Request, res: Response) => {
  try {
    const { wordTestSelects } = req.body;
    const item = await VocabTrainerModel.findById(req.params.id).populate(
      'wordSelects'
    );

    // Calculation score
    const newWordResults = (item.wordSelects as any).map(
      (word: { _id: string | ObjectId | ObjectIdLike; textSource: any }) => {
        const itemB = wordTestSelects.find(
          (item: TWordTestSelect) => item.idWord === word._id.toString()
        );
        if (itemB) {
          const checkStatus =
            itemB.userSelect === word.textSource ? 'Passed' : 'Failed';
          new VocabStatusModel({
            idVocab: word._id.toString(),
            status: checkStatus,
          }).save();

          return {
            userSelect: itemB.userSelect,
            systemSelect: word.textSource,
            status: checkStatus,
          };
        }
      }
    );

    const countCorrectResults = newWordResults.filter(
      (item: TWordResults) => item.userSelect === item.systemSelect
    ).length;

    const totalResults = newWordResults.length;
    const statusResult =
      countCorrectResults / totalResults >= 0.7 ? 'Passed' : 'Failed';

    const result = await VocabTrainerModel.findByIdAndUpdate(req.params.id, {
      $set: {
        duration: req.body.duration,
        statusTest: statusResult,
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
