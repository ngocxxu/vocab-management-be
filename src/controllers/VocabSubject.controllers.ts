import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { VocabSubjectModel } from '../models/VocabSubject.models.js';
import { TVocabSubject } from '../types/VocabSubject.types.js';
import { handleError, safeSerialize } from '../utils/utils.js';

export const getAllVocabSubject = async (req: Request, res: Response) => {
  try {
    const subjects = await VocabSubjectModel.find().select('-__v').lean();
    const result = subjects
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((subject, index) => ({
        ...subject,
        id: index + 1,
      }));

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const addToVocabSubject = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Add new item with order 1
    const newSubject = await new VocabSubjectModel({
      name: req.body.name,
      order: req.body.order,
    }).save({ session });

    await session.commitTransaction();
    res.status(201).json(newSubject);
  } catch (err) {
    await session.abortTransaction();
    handleError(err, res);
  } finally {
    session.endSession();
  }
};

export const updateToVocabSubject = async (req: Request, res: Response) => {
  try {
    const result = await VocabSubjectModel.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
    });

    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

export const reorderVocabSubject = async (req: Request, res: Response) => {
  // Initialize a database session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items } = req.body;

    // Validate input: Ensure items is an array and not empty
    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: 'Invalid input: Items must be a non-empty array',
      });
    }

    // Validate each item has required properties
    const invalidItems = items.filter(
      (item) => !item._id || typeof item.order !== 'number'
    );
    if (invalidItems.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: 'Invalid item structure',
        invalidItems,
      });
    }

    // Verify all items exist in the database
    const existingItemsCount = await VocabSubjectModel.countDocuments({
      _id: { $in: items.map((item) => item._id) },
    });
    if (existingItemsCount !== items.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        error: 'One or more items not found',
      });
    }

    // Fetch and return updated items to ensure frontend has latest data
    const updatedItems = await VocabSubjectModel.find({
      _id: { $in: items.map((item) => item._id) },
    })
      .sort({ order: 1 })
      .session(session);

    // Commit the transaction
    await session.commitTransaction();

    // Convert safe data
    const safeUpdatedItems = safeSerialize<TVocabSubject[]>(
      updatedItems as unknown as TVocabSubject[]
    );

    // Send response with updated items
    res.status(200).json({
      items: safeUpdatedItems
        .map((item, index) => ({
          ...item,
          id: index + 1,
        })),
    });
  } catch (err) {
    console.error('Error reordering vocab subjects', {
      requestBody: req.body,
      errorDetails: {
        type: typeof err,
        constructorName: err?.constructor?.name,
        stringValue: String(err),
        jsonValue: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      },
    });

    // Only abort transaction if it's still active
    if (session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Error aborting transaction', {
          errorMessage:
            abortError instanceof Error ? abortError.message : 'Unknown error',
        });
      }
    }

    handleError(err, res);
  } finally {
    session.endSession();
  }
};

export const removeToVocabSubject = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Tìm và xóa subject
    const deletedSubject = await VocabSubjectModel.findByIdAndDelete(
      req.params.id,
      { session }
    );

    if (!deletedSubject) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Find remaining subjects, sorted by order
    const remainingSubjects = await VocabSubjectModel.find({})
      .sort({ order: 1 })
      .session(session);

    // Prepare bulk write operations to update order
    const bulkOps = remainingSubjects.map((subject, index) => ({
      updateOne: {
        filter: { _id: subject._id },
        update: { $set: { order: index + 1 } },
      },
    }));

    if (bulkOps.length > 0) {
      await VocabSubjectModel.bulkWrite(bulkOps, { session });
    }

    await session.commitTransaction();

    res.status(200).json({
      message: 'Subject removed and orders updated',
      deletedSubject,
      remainingSubjects,
    });
  } catch (err) {
    // Rollback transaction
    await session.abortTransaction();
    handleError(err, res);
  } finally {
    // End session
    session.endSession();
  }
};
