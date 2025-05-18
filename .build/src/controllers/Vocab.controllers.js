var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EPagination } from '../enums/Global.enums.js';
import { VocabModel } from '../models/Vocab.models.js';
import { handleError, searchRegex } from '../utils/utils.js';
import { ALL_VOCAB_CACHE_PREFIX, clearRedisCache, RANDOM_VOCAB_CACHE_PREFIX, VOCAB_CACHE_PREFIX, } from '../utils/redis.js';
export const getAllVocab = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = EPagination.PAGE, limit = EPagination.LIMIT, search, sortBy = 'updatedAt', orderBy = 'desc', statusFilter = [], subjectFilter = [], } = req.query;
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
        const isExist = search || subjectFilterCustom.length > 0 || statusFilterCustom.length > 0;
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
        const data = (yield VocabModel.find(isExist ? querySearch : {})
            .skip(skip)
            .limit(limitNumber)
            .sort([[`${sortBy}`, orderBy]])
            .lean());
        const totalCount = isExist
            ? data.length
            : yield VocabModel.countDocuments();
        const totalPages = Math.ceil(totalCount / limitNumber);
        res.status(200).json({
            data,
            totalPages,
            currentPage: pageNumber,
            totalItems: totalCount,
        });
    }
    catch (err) {
        handleError(err, res);
    }
});
export const getVocab = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = (yield VocabModel.findById({
            _id: req.params.id,
        })
            .sort({
            createdAt: -1,
        })
            .lean());
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
export const randomVocab = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const random = yield VocabModel.aggregate([
            { $sort: { createdAt: -1 } },
            { $sample: { size: Number(req.params.amount) } },
        ]);
        res.status(200).json({ data: random });
    }
    catch (err) {
        handleError(err, res);
    }
});
export const getAllVocabByOneSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const data = yield VocabModel.find(querySearch);
        res.status(200).json({
            data,
        });
    }
    catch (err) {
        handleError(err, res);
    }
});
export const addVocab = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = new VocabModel({
            sourceLanguage: req.body.sourceLanguage,
            targetLanguage: req.body.targetLanguage,
            textSource: req.body.textSource,
            textTarget: req.body.textTarget,
        }).save();
        yield clearRedisCache([
            ALL_VOCAB_CACHE_PREFIX,
            RANDOM_VOCAB_CACHE_PREFIX,
            VOCAB_CACHE_PREFIX,
        ]);
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
export const updateVocab = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield VocabModel.findByIdAndUpdate(req.params.id, {
            sourceLanguage: req.body.sourceLanguage,
            targetLanguage: req.body.targetLanguage,
            textSource: req.body.textSource,
            textTarget: req.body.textTarget,
        });
        yield clearRedisCache([
            ALL_VOCAB_CACHE_PREFIX,
            RANDOM_VOCAB_CACHE_PREFIX,
            VOCAB_CACHE_PREFIX,
        ]);
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
export const removeVocab = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield VocabModel.findByIdAndDelete(req.params.id);
        yield clearRedisCache([
            ALL_VOCAB_CACHE_PREFIX,
            RANDOM_VOCAB_CACHE_PREFIX,
            VOCAB_CACHE_PREFIX,
        ]);
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
export const removeMultiVocab = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield VocabModel.deleteMany({
            _id: { $in: req.body },
        });
        yield clearRedisCache([
            ALL_VOCAB_CACHE_PREFIX,
            RANDOM_VOCAB_CACHE_PREFIX,
            VOCAB_CACHE_PREFIX,
        ]);
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
