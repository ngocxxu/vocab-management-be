import { Response } from 'express';
import { SortOrder } from 'mongoose';
import {
  EPagination,
  EReminderRepeat,
  EStatusResult,
} from '../enums/Global.enums.js';
import { EVocabTrainerType } from '../enums/VocabTrainer.enums.js';
import { VocabModel } from '../models/Vocab.models.js';
import { VocabStatusModel } from '../models/VocabStatus.models.js';
import { VocabTrainerModel } from '../models/VocabTrainer.models.js';
import {
  TDataPaginationRes,
  TParams,
  TRequest,
} from '../types/Global.types.js';
import { TVocabRes } from '../types/Vocab.types.js';
import {
  TAddVocabTrainerReq,
  TGetAllVocabTrainerReq,
  TGetQuestionsRes,
  TQuestions,
  TUpdateTestVocabTrainerReq,
  TUpdateVocabTrainerReq,
  TVocabRemiderRes,
  TVocabTrainerPopulate,
  TVocabTrainerRes,
  TWordResults,
  TWordTestSelect,
} from '../types/VocabTrainer.types.js';
import { getRandomElements, handleError, searchRegex } from '../utils/utils.js';
import {
  ALL_VOCAB_TRAINER_CACHE_PREFIX,
  clearRedisCache,
  QUESTION_VOCAB_TRAINER_CACHE_PREFIX,
  VOCAB_TRAINER_CACHE_PREFIX,
} from '../utils/redis.js';
import { VocabReminderModel } from '../models/VocabReminder.models.js';

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
    userSelect: ele2.userSelect ?? '',
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
  mode: EVocabTrainerType,
  index: number
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

  const sortedTexts = [...texts].sort(() => Math.random() - 0.5);

  return {
    randomOrder: index + 1,
    options: sortedTexts,
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

    const isExist = search ?? statusFilterCustom.length < 3;

    const skip = (pageNumber - 1) * limitNumber;

    const querySearch = {
      $or: [
        { nameTest: searchRegex(String(search)) },
        {
          statusTest: { $in: statusFilterCustom },
        },
      ],
    };

    const data = (await VocabTrainerModel.find(isExist ? querySearch : {})
      .skip(skip)
      .limit(limitNumber)
      .sort([[`${sortBy}`, orderBy as SortOrder]])
      .lean()) as unknown as TVocabTrainerRes[];

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
  res: Response<TVocabTrainerRes | null>
) => {
  try {
    const result = (await VocabTrainerModel.findById(req.params.id)
      .sort({
        createdAt: -1,
      })
      .lean()) as unknown as TVocabTrainerRes;

    if (!result) {
      return res.status(404).json(null);
    }

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};
export const getQuestions = async (
  req: TRequest<TParams, {}, {}>,
  res: Response<Partial<TGetQuestionsRes>>
) => {
  try {
    const item = (await VocabTrainerModel.findById(req.params.id)
      .populate('wordSelects')
      .lean()) as unknown as TVocabTrainerPopulate;

    if (!item) {
      return res.status(404).json({ message: 'VocabTrainer not found' });
    }

    const listWord = (await VocabModel.find(
      {}
    ).lean()) as unknown as TVocabRes[];
    const ids = listWord.map((word) => word._id);

    const result: TQuestions[] = item.wordSelects
      .map((word, index) => {
        const randomElements = getRandomElements(ids, 4, word._id) as string[];

        if (Math.random() < 0.5) {
          return handleTexts(
            listWord,
            randomElements,
            word,
            EVocabTrainerType.SOURCE,
            index
          );
        } else {
          return handleTexts(
            listWord,
            randomElements,
            word,
            EVocabTrainerType.TARGET,
            index
          );
        }
      })
      .sort(() => Math.random() - 0.5)
      .map((item, idx) => ({ ...item, order: idx + 1 }));

    res.status(200).json({
      nameTest: item.nameTest,
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
    const existingVocabTrainer = await VocabTrainerModel.findOne({
      nameTest: { $regex: new RegExp(`^${req.body.nameTest}$`, 'i') },
    });

    if (existingVocabTrainer) {
      return res.status(400).json({
        message: 'Name test already exists',
      });
    }

    const vocabTrainer = new VocabTrainerModel({
      nameTest: req.body.nameTest,
      wordSelects: req.body.wordSelects,
      setCountTime: req.body.setCountTime,
    });

    const savedVocabTrainer = await vocabTrainer.save();

    new VocabReminderModel({
      vocabTrainer: savedVocabTrainer._id,
    }).save();

    await clearRedisCache([
      ALL_VOCAB_TRAINER_CACHE_PREFIX,
      QUESTION_VOCAB_TRAINER_CACHE_PREFIX,
      VOCAB_TRAINER_CACHE_PREFIX,
    ]);

    res.status(200).json(savedVocabTrainer);
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
    await clearRedisCache([
      ALL_VOCAB_TRAINER_CACHE_PREFIX,
      QUESTION_VOCAB_TRAINER_CACHE_PREFIX,
      VOCAB_TRAINER_CACHE_PREFIX,
    ]);
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

    const item = (await VocabTrainerModel.findById(req.params.id)
      .populate('wordSelects')
      .lean()) as unknown as TVocabTrainerPopulate;

    if (!item) {
      return res.status(404).json({ message: 'VocabTrainer not found' });
    }

    const itemVocabReminder = (await VocabReminderModel.findOne({
      vocabTrainer: req.params.id,
    }).lean()) as unknown as TVocabRemiderRes;

    if (!itemVocabReminder) {
      return res.status(404).json({ message: 'VocabReminder not found' });
    }

    const newWordResults: TWordResults[] = [];

    const arrangeOrder = [...wordTestSelects].sort(
      (a, b) => a.randomOrder - b.randomOrder
    );

    for (let i = 0; i < item.wordSelects.length; i++) {
      const element = item.wordSelects[i];

      for (let j = 0; j < arrangeOrder.length; j++) {
        if (i === j) {
          const element2 = arrangeOrder[j];
          if (element2.idWord === element._id.toString()) {
            handleWordResult(
              element,
              element2,
              EStatusResult.PASSED,
              newWordResults
            );
          } else {
            handleWordResult(
              element,
              element2,
              EStatusResult.FAILED,
              newWordResults
            );
          }
        }
      }
    }

    const countCorrectResults = newWordResults.filter(
      (item: TWordResults) => item.status === EStatusResult.PASSED
    ).length;

    const totalResults = newWordResults.length;
    const statusResult =
      countCorrectResults / totalResults >= 0.7
        ? EStatusResult.PASSED
        : EStatusResult.FAILED;

    //Reminder user do test
    if (statusResult === EStatusResult.PASSED) {
      const updates = {
        lastRemind: new Date(),
        ...(itemVocabReminder.repeat >= EReminderRepeat.THIRTY_TWO_DAYS
          ? { disabled: true }
          : { repeat: itemVocabReminder.repeat * 2 }),
      };

      await VocabReminderModel.findOneAndUpdate(
        { vocabTrainer: req.params.id },
        { $set: updates }
      );
    }

    const result = (await VocabTrainerModel.findByIdAndUpdate(
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
      },
      { new: true }
    ).lean()) as unknown as TVocabTrainerRes;

    if (!result) {
      return res.status(404).json({ message: 'Failed to update VocabTrainer' });
    }

    await clearRedisCache([
      ALL_VOCAB_TRAINER_CACHE_PREFIX,
      QUESTION_VOCAB_TRAINER_CACHE_PREFIX,
      VOCAB_TRAINER_CACHE_PREFIX,
    ]);
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

    await VocabReminderModel.findOneAndDelete({ vocabTrainer: req.params.id });

    await clearRedisCache([
      ALL_VOCAB_TRAINER_CACHE_PREFIX,
      QUESTION_VOCAB_TRAINER_CACHE_PREFIX,
      VOCAB_TRAINER_CACHE_PREFIX,
    ]);
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
    await clearRedisCache([
      ALL_VOCAB_TRAINER_CACHE_PREFIX,
      QUESTION_VOCAB_TRAINER_CACHE_PREFIX,
      VOCAB_TRAINER_CACHE_PREFIX,
    ]);
    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};
