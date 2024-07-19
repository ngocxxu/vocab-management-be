import { ObjectId, ObjectIdLike } from 'bson';
import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';
import { VocabModel } from '../models/Vocab.models';
import { VocabStatusModel } from '../models/VocabStatus.models';
import { VocabTrainerModel } from '../models/VocabTrainer.models';
import { TWordResults } from '../types/VocabTrainer.types';
import { getRandomElements, handleError, searchRegex } from '../utils/index';

const handleWordResult = (ele: any, ele2: any, stt: string, array: any) => {
  new VocabStatusModel({
    idVocab: ele._id.toString(),
    status: stt,
  }).save();

  array.push({
    userSelect: ele2.userSelect,
    systemSelect: ele.textSource,
    status: stt,
  });
};

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

const handleTextSources = (
  listWord: any,
  randomElements: any[],
  index: number,
  word: any
) => {
  const textSources = listWord
    .filter((item: any) => randomElements.includes(item._id))
    .map((item2: any) => ({
      label: item2.textSource,
      value: item2._id,
    }));

  return {
    order: index++ + 1,
    options: textSources.sort(() => Math.random() - 0.5),
    content: word.textTarget.map((item: { text: string }) => item.text),
    type: 'source',
  };
};

const handleTextTargets = (
  listWord: any,
  randomElements: any[],
  index: number,
  word: any
) => {
  const textTargets = listWord
    .filter((item: any) => randomElements.includes(item._id))
    .map((item2: any) => ({
      label: item2.textTarget.map((item3: any) => item3.text.trim()).join(', '),
      value: item2._id,
    }));

  return {
    order: index++ + 1,
    options: textTargets.sort(() => Math.random() - 0.5),
    content: [word.textSource.trim()],
    type: 'target',
  };
};

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const item = await VocabTrainerModel.findById(req.params.id).populate(
      'wordSelects'
    );
    const listWord = await VocabModel.find({});
    const ids = listWord.map((word) => word._id);

    const result = (item.wordSelects as any).map(
      (
        word: {
          _id: string | ObjectId | ObjectIdLike;
          textSource: string;
          textTarget: any;
        },
        index: number
      ) => {
        const randomElements = getRandomElements(ids, 4, word._id);

        if (Math.random() < 0.5) {
          return handleTextSources(listWord, randomElements, index, word);
        } else {
          return handleTextTargets(listWord, randomElements, index, word);
        }
      }
    );

    console.log({ result });

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
      'wordSelects'
    );

    const newWordResults: any = [];

    for (let i = 0; i < (item.wordSelects as any).length; i++) {
      const element = (item.wordSelects as any)[i];

      for (let j = 0; j < wordTestSelects.length; j++) {
        if (i === j) {
          const element2 = wordTestSelects[j];
          if (element2.idWord === element._id.toString()) {
            handleWordResult(element, element2, 'Passed', newWordResults);
          } else {
            handleWordResult(element, element2, 'Failed', newWordResults);
          }
        }
      }
    }

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
