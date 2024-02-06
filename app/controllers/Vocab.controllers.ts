import { Request, Response } from "express";
import { handleError, searchRegex } from "../utils/index";
import { VocabModel } from "../models/Vocab.models";
import { SortOrder } from "mongoose";

export const getAllVocab = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "updatedAt",
      orderBy = "desc",
      // statusFilter = [],
      subjectFilter = [],
    } = req.query;
    let subjectFilterCustom = subjectFilter;

    // Convert page & limit to number
    const pageNumber: number = parseInt(String(page), 10);
    const limitNumber: number = parseInt(String(limit), 10);

    // Check validation
    if (isNaN(pageNumber)) {
      throw new Error("Invalid page number");
    }
    if (typeof subjectFilter === "string") {
      subjectFilterCustom = [subjectFilter];
    }
    const isExist = search || (subjectFilterCustom as string[]).length > 0;

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
      ],
    };

    const data = await VocabModel.find(isExist ? querySearch : {})
      .skip(skip)
      .limit(limitNumber)
      .sort([[`${sortBy}`, orderBy as SortOrder]]);

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

export const removeMultiVocab = async (req: Request, res: Response) => {
  try {
    const result = await VocabModel.deleteMany({
      _id: { $in: req.body },
    });

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};
