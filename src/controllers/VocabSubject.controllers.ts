import { Request, Response } from 'express';
import { handleError } from '../utils/utils.js';
import { VocabSubjectModel } from '../models/VocabSubject.models.js';
import mongoose from 'mongoose';

export const getAllVocabSubject = async (req: Request, res: Response) => {
  try {
    const subjects = await VocabSubjectModel.find().select('-__v').lean();
    const result = subjects.map((subject, index) => ({
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
    // Increment all existing items' orders
    await VocabSubjectModel.updateMany({}, { $inc: { order: 1 } }, { session });

    // Add new item with order 1
    const newSubject = await new VocabSubjectModel({
      name: req.body.name,
      order: 1,
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

    // Prepare bulk write operations
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: {
          $set: {
            order: item.order,
          },
        },
      },
    }));

    // Execute bulk write operation
    const bulkWriteResult = await VocabSubjectModel.bulkWrite(bulkOps, {
      session,
    });

    // Log the reordering operation
    console.info('Vocab subjects reordered', {
      itemsCount: items.length,
      modifiedCount: bulkWriteResult.modifiedCount,
    });

    // Fetch and return updated items to ensure frontend has latest data
    const updatedItems = await VocabSubjectModel.find({
      _id: { $in: items.map((item) => item._id) },
    })
      .sort({ order: 1 })
      .session(session);

    // Commit the transaction
    await session.commitTransaction();

    // Send response with updated items
    res.status(200).json({
      message: 'Subjects reordered successfully',
      items: updatedItems.map((item, index) => ({
        ...item,
        id: index,
      })),
      modifiedCount: bulkWriteResult.modifiedCount,
    });
  } catch (err) {
    await session.abortTransaction();

    console.error('Error reordering vocab subjects', {
      error: err,
      requestBody: req.body,
    });

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
