import { Response } from 'express';
import { SortOrder } from 'mongoose';
import { EPagination } from '../enums/Global.enums';
import { VocabModel } from '../models/Vocab.models';
import { TDataPaginationRes, TParams, TRequest } from '../types/Global.types';
import {
  TAddVocabReq,
  TGetAllVocabReq,
  TRandomVocabReq,
  TRandomVocabRes,
  TUpdateVocabReq,
  TVocabRes,
} from '../types/Vocab.types';
import { handleError, searchRegex } from '../utils/index';

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
              subject: { $elemMatch: { value: { $in: subjectFilterCustom } } },
            },
          },
        },
        {
          statusTest: { $in: statusFilterCustom },
        },
      ],
    };

    const data: TVocabRes[] = await VocabModel.find(isExist ? querySearch : {})
      .skip(skip)
      .limit(limitNumber)
      .sort([[`${sortBy}`, orderBy as SortOrder]])
      .lean();

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
  res: Response<TVocabRes>
) => {
  try {
    const result: TVocabRes = await VocabModel.findById({
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

export const addVocab = async (
  req: TRequest<{}, TAddVocabReq, {}>,
  res: Response
) => {
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

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};
