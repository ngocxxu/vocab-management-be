import { ObjectId, ObjectIdLike } from 'bson';
import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';
import { EPagination, TStatusResult } from '../enums/Global.enums';
import { EVocabTrainerType } from '../enums/VocabTrainer.enums';
import { VocabModel } from '../models/Vocab.models';
import { VocabStatusModel } from '../models/VocabStatus.models';
import { VocabTrainerModel } from '../models/VocabTrainer.models';
import { TDataPaginationRes, TParams, TRequest } from '../types/Global.types';
import {
  TAddVocabTrainerReq,
  TGetAllVocabTrainerReq,
  TGetQuestionsRes,
  TQuestions,
  TUpdateTestVocabTrainerReq,
  TUpdateVocabTrainerReq,
  TVocabTrainerPopulate,
  TVocabTrainerRes,
  TWordResults,
  TWordTestSelect,
} from '../types/VocabTrainer.types';
import { getRandomElements, handleError, searchRegex } from '../utils/index';
import { TVocabRes } from '../types/Vocab.types';

const handleWordResult = (
  ele: TVocabRes,
  ele2: TWordTestSelect,
  stt: string,
  data: TWordResults[]
) => {
  new VocabStatusModel({
    idVocab: ele._id.toString(),
    status: stt,
  }).save();

  data.push({
    userSelect: ele2.userSelect,
    systemSelect:
      ele2.type === EVocabTrainerType.SOURCE
        ? ele.textSource
        : ele.textTarget.map((item3) => item3.text.trim()).join(', '),
    status: stt,
  });
};

const handleTexts = (
  listWord: TVocabRes[],
  randomElements: string[],
  word: TVocabRes,
  mode: EVocabTrainerType
) => {
  const texts = listWord
    .filter((item) => randomElements.includes(item._id))
    .map((item2) => {
      if (mode === EVocabTrainerType.SOURCE) {
        return {
          label: item2.textSource,
          value: item2._id,
        };
      } else {
        return {
          label: item2.textTarget.map((item3) => item3.text.trim()).join(', '),
          value: item2._id,
        };
      }
    });

  return {
    options: texts.sort(() => Math.random() - 0.5),
    content:
      mode === EVocabTrainerType.SOURCE
        ? word.textTarget.map((item: { text: string }) => item.text)
        : [word.textSource.trim()],
    type: mode,
  };
};

export const getAllVocabTrainer = async (
  req: TRequest<{}, {}, TGetAllVocabTrainerReq>,
  res: Response<TDataPaginationRes<TVocabTrainerRes[]>>
) => {
  try {
    const {
      page = EPagination.PAGE,
      limit = EPagination.LIMIT,
      search,
      sortBy = 'updatedAt',
      orderBy = 'desc',
      statusFilter = [],
    } = req.query;
    let statusFilterCustom = statusFilter;

    // Convert page & limit to number
    const pageNumber: number = parseInt(String(page));
    const limitNumber: number = parseInt(String(limit));

    // Check validation
    if (isNaN(pageNumber)) {
      throw new Error('Invalid page number');
    }
    if (typeof statusFilter === 'string') {
      statusFilterCustom = [statusFilter];
    }

    const isExist = search || statusFilterCustom.length < 3;

    const skip = (pageNumber - 1) * limitNumber;

    const querySearch = {
      $or: [
        { nameTest: searchRegex(String(search)) },
        {
          statusTest: { $in: statusFilterCustom },
        },
      ],
    };

    const data: TVocabTrainerRes[] = await VocabTrainerModel.find(
      isExist ? querySearch : {}
    )
      .skip(skip)
      .limit(limitNumber)
      .sort([[`${sortBy}`, orderBy as SortOrder]])
      .lean();

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

export const getVocabTrainer = async (
  req: TRequest<TParams, {}, {}>,
  res: Response<TVocabTrainerRes>
) => {
  try {
    const result: TVocabTrainerRes = await VocabTrainerModel.findById({
      _id: req.params.id,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const getQuestions = async (
  req: TRequest<TParams, {}, {}>,
  res: Response<TGetQuestionsRes>
) => {
  try {
    const item: TVocabTrainerPopulate = await VocabTrainerModel.findById(
      req.params.id
    )
      .populate('wordSelects')
      .lean();
    const listWord: TVocabRes[] = await VocabModel.find({}).lean();
    const ids = listWord.map((word) => word._id);

    const result: TQuestions[] = item.wordSelects
      .map((word) => {
        const randomElements = getRandomElements(ids, 4, word._id);

        if (Math.random() < 0.5) {
          return handleTexts(
            listWord,
            randomElements,
            word,
            EVocabTrainerType.SOURCE
          );
        } else {
          return handleTexts(
            listWord,
            randomElements,
            word,
            EVocabTrainerType.TARGET
          );
        }
      })
      // .sort(() => Math.random() - 0.5)
      .map((item: TQuestions, idx) => ({ ...item, order: idx + 1 }));

    res.status(200).json({
      questions: result,
      setCountTime: item.setCountTime,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const addVocabTrainer = async (
  req: TRequest<{}, TAddVocabTrainerReq, {}>,
  res: Response
) => {
  try {
    const result = new VocabTrainerModel({
      nameTest: req.body.nameTest,
      wordSelects: req.body.wordSelects,
      setCountTime: req.body.setCountTime,
    }).save();

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const updateVocabTrainer = async (
  req: TRequest<TParams, TUpdateVocabTrainerReq, {}>,
  res: Response
) => {
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

export const updateTestVocabTrainer = async (
  req: TRequest<TParams, TUpdateTestVocabTrainerReq, {}>,
  res: Response
) => {
  try {
    const { wordTestSelects } = req.body;

    const item: TVocabTrainerPopulate = await VocabTrainerModel.findById(
      req.params.id
    )
      .populate('wordSelects')

    const newWordResults: TWordResults[] = [];

    for (let i = 0; i < item.wordSelects.length; i++) {
      const element = item.wordSelects[i];

      for (let j = 0; j < wordTestSelects.length; j++) {
        if (i === j) {
          const element2 = wordTestSelects[j];
          if (element2.idWord === element._id.toString()) {
            handleWordResult(
              element,
              element2,
              TStatusResult.PASSED,
              newWordResults
            );
          } else {
            handleWordResult(
              element,
              element2,
              TStatusResult.FAILED,
              newWordResults
            );
          }
        }
      }
    }

    const countCorrectResults = newWordResults.filter(
      (item: TWordResults) => item.status === TStatusResult.PASSED
    ).length;

    const totalResults = newWordResults.length;
    const statusResult =
      countCorrectResults / totalResults >= 0.7
        ? TStatusResult.PASSED
        : TStatusResult.FAILED;

    const result: TVocabTrainerRes = await VocabTrainerModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          duration: req.body.duration,
          statusTest: statusResult,
          wordResults: newWordResults,
        },
        $inc: {
          countTime: 1,
        },
      }
    ).lean();

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const removeVocabTrainer = async (
  req: TRequest<TParams, {}, {}>,
  res: Response
) => {
  try {
    const result = await VocabTrainerModel.findByIdAndDelete(req.params.id);

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const removeMultiVocabTrainer = async (
  req: TRequest<{}, string[], {}>,
  res: Response
) => {
  try {
    const result = await VocabTrainerModel.deleteMany({
      _id: { $in: req.body },
    });
    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};
