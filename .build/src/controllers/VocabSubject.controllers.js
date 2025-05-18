var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from 'mongoose';
import { VocabSubjectModel } from '../models/VocabSubject.models.js';
import { handleError, safeSerialize } from '../utils/utils.js';
export const getAllVocabSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subjects = yield VocabSubjectModel.find().select('-__v').lean();
        const data = subjects
            .sort((a, b) => { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 0) - ((_b = b.order) !== null && _b !== void 0 ? _b : 0); })
            .map((subject, index) => (Object.assign(Object.assign({}, subject), { id: index + 1 })));
        res.status(200).json({ data });
    }
    catch (err) {
        handleError(err, res);
    }
});
export const addToVocabSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose.startSession();
    session.startTransaction();
    try {
        // Add new item with order 1
        const newSubject = yield new VocabSubjectModel({
            name: req.body.name,
            order: req.body.order,
        }).save({ session });
        yield session.commitTransaction();
        res.status(201).json(newSubject);
    }
    catch (err) {
        yield session.abortTransaction();
        handleError(err, res);
    }
    finally {
        session.endSession();
    }
});
export const updateToVocabSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield VocabSubjectModel.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
        });
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
export const reorderVocabSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Initialize a database session for transaction
    const session = yield mongoose.startSession();
    session.startTransaction();
    try {
        const { items } = req.body;
        // Validate input: Ensure items is an array and not empty
        if (!items || !Array.isArray(items) || items.length === 0) {
            yield session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                error: 'Invalid input: Items must be a non-empty array',
            });
        }
        // Validate each item has required properties
        const invalidItems = items.filter((item) => !item._id || typeof item.order !== 'number');
        if (invalidItems.length > 0) {
            yield session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                error: 'Invalid item structure',
                invalidItems,
            });
        }
        // Verify all items exist in the database
        const existingItemsCount = yield VocabSubjectModel.countDocuments({
            _id: { $in: items.map((item) => item._id) },
        });
        if (existingItemsCount !== items.length) {
            yield session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                error: 'One or more items not found',
            });
        }
        // Fetch and return updated items to ensure frontend has latest data
        const updatedItems = yield VocabSubjectModel.find({
            _id: { $in: items.map((item) => item._id) },
        })
            .sort({ order: 1 })
            .session(session);
        // Commit the transaction
        yield session.commitTransaction();
        // Convert safe data
        const safeUpdatedItems = safeSerialize(updatedItems);
        // Send response with updated items
        res.status(200).json({
            items: safeUpdatedItems.map((item, index) => (Object.assign(Object.assign({}, item), { id: index + 1 }))),
        });
    }
    catch (err) {
        console.error('Error reordering vocab subjects', {
            requestBody: req.body,
            errorDetails: {
                type: typeof err,
                constructorName: (_a = err === null || err === void 0 ? void 0 : err.constructor) === null || _a === void 0 ? void 0 : _a.name,
                stringValue: String(err),
                jsonValue: JSON.stringify(err, Object.getOwnPropertyNames(err)),
            },
        });
        // Only abort transaction if it's still active
        if (session.inTransaction()) {
            try {
                yield session.abortTransaction();
            }
            catch (abortError) {
                console.error('Error aborting transaction', {
                    errorMessage: abortError instanceof Error ? abortError.message : 'Unknown error',
                });
            }
        }
        handleError(err, res);
    }
    finally {
        session.endSession();
    }
});
export const removeToVocabSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose.startSession();
    session.startTransaction();
    try {
        // Tìm và xóa subject
        const deletedSubject = yield VocabSubjectModel.findByIdAndDelete(req.params.id, { session });
        if (!deletedSubject) {
            yield session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Subject not found' });
        }
        // Find remaining subjects, sorted by order
        const remainingSubjects = yield VocabSubjectModel.find({})
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
            yield VocabSubjectModel.bulkWrite(bulkOps, { session });
        }
        yield session.commitTransaction();
        res.status(200).json({
            message: 'Subject removed and orders updated',
            deletedSubject,
            remainingSubjects,
        });
    }
    catch (err) {
        // Rollback transaction
        yield session.abortTransaction();
        handleError(err, res);
    }
    finally {
        // End session
        session.endSession();
    }
});
