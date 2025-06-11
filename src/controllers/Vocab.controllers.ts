import { Response } from 'express';
import { SortOrder } from 'mongoose';
import { EPagination } from '../enums/Global.enums.js';
import { VocabModel } from '../models/Vocab.models.js';
import {
  TDataPaginationRes,
  TParams,
  TRequest,
} from '../types/Global.types.js';
import {
  TAddVocabReq,
  TGetAllVocabReq,
  TRandomVocabReq,
  TRandomVocabRes,
  TUpdateVocabReq,
  TVocabRes,
} from '../types/Vocab.types';
import { handleError, searchRegex } from '../utils/utils.js';
import {
  ALL_VOCAB_CACHE_PREFIX,
  clearRedisCache,
  RANDOM_VOCAB_CACHE_PREFIX,
  VOCAB_CACHE_PREFIX,
} from '../utils/redis.js';
import { sendVocabNotification } from '../utils/socket.js';

export const getAllVocab = async (
  req: TRequest<{}, {}, TGetAllVocabReq>,
  res: Response<TDataPaginationRes<TVocabRes[]>>
) => {
  try {
    const {
      page = EPagination.PAGE,
      limit = EPagination.LIMIT,
      search,
      sortBy = 'updatedAt',
      orderBy = 'desc',
      statusFilter = [],
      subjectFilter = [],
    } = req.query;
    let subjectFilterCustom = subjectFilter;
    let statusFilterCustom = statusFilter;

    // Convert page & limit to number
    const pageNumber = parseInt(String(page));
    const limitNumber = parseInt(String(limit));

    // Check validation
    if (isNaN(pageNumber)) {
      throw new Error('Invalid page number');
    }

    if (typeof subjectFilter === 'string') {
      subjectFilterCustom = [subjectFilter];
    }
    if (typeof statusFilter === 'string') {
      statusFilterCustom = [statusFilter];
    }

    const isExist =
      search || subjectFilterCustom.length > 0 || statusFilterCustom.length > 0;

    const skip = (pageNumber - 1) * limitNumber;

    const querySearch = {
      $or: [
        { textSource: searchRegex(String(search)) },
        {
          textTarget: {
            $elemMatch: { text: searchRegex(String(search)) },
          },
        },
        {
          textTarget: {
            $elemMatch: {
              subject: { $elemMatch: { label: { $in: subjectFilterCustom } } },
            },
          },
        },
        {
          statusTest: { $in: statusFilterCustom },
        },
      ],
    };

    const data = (await VocabModel.find(isExist ? querySearch : {})
      .skip(skip)
      .limit(limitNumber)
      .sort([[`${sortBy}`, orderBy as SortOrder]])
      .lean()) as unknown as TVocabRes[];

    const totalCount = isExist
      ? data.length
      : await VocabModel.countDocuments();
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

export const getVocab = async (
  req: TRequest<TParams, {}, {}>,
  res: Response<TVocabRes | null>
) => {
  try {
    const result = (await VocabModel.findById({
      _id: req.params.id,
    })
      .sort({
        createdAt: -1,
      })
      .lean()) as unknown as TVocabRes;
    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};
export const randomVocab = async (
  req: TRequest<TRandomVocabReq, {}, {}>,
  res: Response<TRandomVocabRes>
) => {
  try {
    const random: TVocabRes[] = await VocabModel.aggregate([
      { $sort: { createdAt: -1 } },
      { $sample: { size: Number(req.params.amount) } },
    ]);

    res.status(200).json({ data: random });
  } catch (err) {
    handleError(err, res);
  }
};

export const getAllVocabByOneSubject = async (
  req: TRequest<{ subjectId: string }, {}, {}>,
  res: Response
) => {
  try {
    const { subjectId } = req.params;

    const querySearch = {
      $and: [
        {
          'textTarget.subject': {
            $elemMatch: { label: subjectId },
          },
        },
        {
          'textTarget.subject': {
            $size: 1,
          },
        },
      ],
    };

    const data = await VocabModel.find(querySearch);

    res.status(200).json({
      data,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const addVocab = async (
  req: TRequest<{}, TAddVocabReq, {}>,
  res: Response
) => {
  try {
    const result = await new VocabModel({
      sourceLanguage: req.body.sourceLanguage,
      targetLanguage: req.body.targetLanguage,
      textSource: req.body.textSource,
      textTarget: req.body.textTarget,
    }).save();

    await clearRedisCache([
      ALL_VOCAB_CACHE_PREFIX,
      RANDOM_VOCAB_CACHE_PREFIX,
      VOCAB_CACHE_PREFIX,
    ]);

    if (!result) {
      return res.status(404).json({ message: 'Vocab not found' });
    }

    // Send notification via socket
    sendVocabNotification('created', {
      message: `Vocab "${result.textSource}" has been created`,
      word: result.textSource,
      userEmail: req.user.email,
    });

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};
export const addMultiVocab = async (
  req: TRequest<{}, TAddVocabReq[], {}>,
  res: Response
) => {
  try {
    // Validate input array
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res
        .status(400)
        .json({ error: 'Invalid or empty vocabulary array' });
    }

    // Bulk insert vocab entries
    const vocabEntries = req.body.map((vocab) => ({
      sourceLanguage: vocab.sourceLanguage,
      targetLanguage: vocab.targetLanguage,
      textSource: vocab.textSource,
      textTarget: vocab.textTarget,
    }));

    const result = await VocabModel.insertMany(vocabEntries, {
      ordered: false,
    });

    await clearRedisCache([
      ALL_VOCAB_CACHE_PREFIX,
      RANDOM_VOCAB_CACHE_PREFIX,
      VOCAB_CACHE_PREFIX,
    ]);

    if (!result) {
      return res.status(404).json({ message: 'Vocab not found' });
    }

    // Send notification via socket
    sendVocabNotification('multi-created', {
      message: `${req.body.length} vocab have been created`,
      userEmail: req.user.email,
    });

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const updateVocab = async (
  req: TRequest<TParams, TUpdateVocabReq, {}>,
  res: Response
) => {
  try {
    const result = await VocabModel.findByIdAndUpdate(req.params.id, {
      sourceLanguage: req.body.sourceLanguage,
      targetLanguage: req.body.targetLanguage,
      textSource: req.body.textSource,
      textTarget: req.body.textTarget,
    });

    await clearRedisCache([
      ALL_VOCAB_CACHE_PREFIX,
      RANDOM_VOCAB_CACHE_PREFIX,
      VOCAB_CACHE_PREFIX,
    ]);

    if (!result) {
      return res.status(404).json({ message: 'Vocab not found' });
    }

    // Send notification via socket
    sendVocabNotification('updated', {
      message: `Vocab "${result.textSource}" has been updated`,
      vocabId: req.params.id,
      word: result.textSource,
      userEmail: req.user.email,
    });

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const removeVocab = async (
  req: TRequest<TParams, {}, {}>,
  res: Response
) => {
  try {
    const result = await VocabModel.findByIdAndDelete(req.params.id);

    await clearRedisCache([
      ALL_VOCAB_CACHE_PREFIX,
      RANDOM_VOCAB_CACHE_PREFIX,
      VOCAB_CACHE_PREFIX,
    ]);

    if (!result) {
      return res.status(404).json({ message: 'Vocab not found' });
    }

    // Send notification via socket
    sendVocabNotification('deleted', {
      message: `Vocab "${result.textSource}" has been deleted`,
      vocabId: req.params.id,
      word: result.textSource,
      userEmail: req.user.email,
    });

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const removeMultiVocab = async (
  req: TRequest<{}, string[], {}>,
  res: Response
) => {
  try {
    const result = await VocabModel.deleteMany({
      _id: { $in: req.body },
    });

    await clearRedisCache([
      ALL_VOCAB_CACHE_PREFIX,
      RANDOM_VOCAB_CACHE_PREFIX,
      VOCAB_CACHE_PREFIX,
    ]);

    // Send notification via socket
    sendVocabNotification('multi-deleted', {
      message: `${req.body.length} vocab have been deleted`,
      vocabIds: req.body,
      userEmail: req.user.email,
    });

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};
