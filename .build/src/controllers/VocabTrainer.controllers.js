var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EPagination, EReminderRepeat, EStatusResult, } from '../enums/Global.enums.js';
import { EVocabTrainerType } from '../enums/VocabTrainer.enums.js';
import { VocabModel } from '../models/Vocab.models.js';
import { VocabStatusModel } from '../models/VocabStatus.models.js';
import { VocabTrainerModel } from '../models/VocabTrainer.models.js';
import { getRandomElements, handleError, searchRegex } from '../utils/utils.js';
import { ALL_VOCAB_TRAINER_CACHE_PREFIX, clearRedisCache, QUESTION_VOCAB_TRAINER_CACHE_PREFIX, VOCAB_TRAINER_CACHE_PREFIX, } from '../utils/redis.js';
import { VocabReminderModel } from '../models/VocabReminder.models.js';
const handleWordResult = (ele, ele2, stt, data) => {
    var _a;
    new VocabStatusModel({
        idVocab: ele._id.toString(),
        status: stt,
    }).save();
    data.push({
        userSelect: (_a = ele2.userSelect) !== null && _a !== void 0 ? _a : '',
        systemSelect: ele2.type === EVocabTrainerType.SOURCE
            ? ele.textSource
            : ele.textTarget.map((item3) => item3.text.trim()).join(', '),
        status: stt,
    });
};
const handleTexts = (listWord, randomElements, word, mode, index) => {
    const texts = listWord
        .filter((item) => randomElements.includes(item._id))
        .map((item2) => {
        if (mode === EVocabTrainerType.SOURCE) {
            return {
                label: item2.textSource,
                value: item2._id,
            };
        }
        else {
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
        content: mode === EVocabTrainerType.SOURCE
            ? word.textTarget.map((item) => item.text)
            : [word.textSource.trim()],
        type: mode,
    };
};
export const getAllVocabTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = EPagination.PAGE, limit = EPagination.LIMIT, search, sortBy = 'updatedAt', orderBy = 'desc', statusFilter = [], } = req.query;
        let statusFilterCustom = statusFilter;
        // Convert page & limit to number
        const pageNumber = parseInt(String(page));
        const limitNumber = parseInt(String(limit));
        // Check validation
        if (isNaN(pageNumber)) {
            throw new Error('Invalid page number');
        }
        if (typeof statusFilter === 'string') {
            statusFilterCustom = [statusFilter];
        }
        const isExist = search !== null && search !== void 0 ? search : statusFilterCustom.length < 3;
        const skip = (pageNumber - 1) * limitNumber;
        const querySearch = {
            $or: [
                { nameTest: searchRegex(String(search)) },
                {
                    statusTest: { $in: statusFilterCustom },
                },
            ],
        };
        const data = (yield VocabTrainerModel.find(isExist ? querySearch : {})
            .skip(skip)
            .limit(limitNumber)
            .sort([[`${sortBy}`, orderBy]])
            .lean());
        const totalCount = isExist
            ? data.length
            : yield VocabTrainerModel.countDocuments();
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
export const getVocabTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = (yield VocabTrainerModel.findById(req.params.id)
            .sort({
            createdAt: -1,
        })
            .lean());
        if (!result) {
            return res.status(404).json(null);
        }
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
export const getQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = (yield VocabTrainerModel.findById(req.params.id)
            .populate('wordSelects')
            .lean());
        if (!item) {
            return res.status(404).json({ message: 'Your test is not found!' });
        }
        const listWord = (yield VocabModel.find({}).lean());
        const ids = listWord.map((word) => word._id);
        const result = item.wordSelects
            .map((word, index) => {
            const randomElements = getRandomElements(ids, 4, word._id);
            if (Math.random() < 0.5) {
                return handleTexts(listWord, randomElements, word, EVocabTrainerType.SOURCE, index);
            }
            else {
                return handleTexts(listWord, randomElements, word, EVocabTrainerType.TARGET, index);
            }
        })
            .sort(() => Math.random() - 0.5)
            .map((item, idx) => (Object.assign(Object.assign({}, item), { order: idx + 1 })));
        res.status(200).json({
            nameTest: item.nameTest,
            questions: result,
            setCountTime: item.setCountTime,
        });
    }
    catch (err) {
        handleError(err, res);
    }
});
export const addVocabTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingVocabTrainer = yield VocabTrainerModel.findOne({
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
        const savedVocabTrainer = yield vocabTrainer.save();
        new VocabReminderModel({
            vocabTrainer: savedVocabTrainer._id,
        }).save();
        yield clearRedisCache([
            ALL_VOCAB_TRAINER_CACHE_PREFIX,
            QUESTION_VOCAB_TRAINER_CACHE_PREFIX,
            VOCAB_TRAINER_CACHE_PREFIX,
        ]);
        res.status(200).json(savedVocabTrainer);
    }
    catch (err) {
        handleError(err, res);
    }
});
export const updateVocabTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield VocabTrainerModel.findByIdAndUpdate(req.params.id, {
            sourceLanguage: req.body.sourceLanguage,
            targetLanguage: req.body.targetLanguage,
            textSource: req.body.textSource,
            textTarget: req.body.textTarget,
        });
        yield clearRedisCache([
            ALL_VOCAB_TRAINER_CACHE_PREFIX,
            QUESTION_VOCAB_TRAINER_CACHE_PREFIX,
            VOCAB_TRAINER_CACHE_PREFIX,
        ]);
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
export const updateTestVocabTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { wordTestSelects } = req.body;
        const item = (yield VocabTrainerModel.findById(req.params.id)
            .populate('wordSelects')
            .lean());
        if (!item) {
            return res.status(404).json({ message: 'VocabTrainer not found' });
        }
        const itemVocabReminder = (yield VocabReminderModel.findOne({
            vocabTrainer: req.params.id,
        }).lean());
        if (!itemVocabReminder) {
            return res.status(404).json({ message: 'VocabReminder not found' });
        }
        const newWordResults = [];
        const arrangeOrder = [...wordTestSelects].sort((a, b) => a.randomOrder - b.randomOrder);
        for (let i = 0; i < item.wordSelects.length; i++) {
            const element = item.wordSelects[i];
            for (let j = 0; j < arrangeOrder.length; j++) {
                if (i === j) {
                    const element2 = arrangeOrder[j];
                    if (element2.idWord === element._id.toString()) {
                        handleWordResult(element, element2, EStatusResult.PASSED, newWordResults);
                    }
                    else {
                        handleWordResult(element, element2, EStatusResult.FAILED, newWordResults);
                    }
                }
            }
        }
        const countCorrectResults = newWordResults.filter((item) => item.status === EStatusResult.PASSED).length;
        const totalResults = newWordResults.length;
        const statusResult = countCorrectResults / totalResults >= 0.7
            ? EStatusResult.PASSED
            : EStatusResult.FAILED;
        //Reminder user do test
        if (statusResult === EStatusResult.PASSED) {
            const updates = Object.assign({ lastRemind: new Date() }, (itemVocabReminder.repeat >= EReminderRepeat.THIRTY_TWO_DAYS
                ? { disabled: true }
                : { repeat: itemVocabReminder.repeat * 2 }));
            yield VocabReminderModel.findOneAndUpdate({ vocabTrainer: req.params.id }, { $set: updates });
        }
        const result = (yield VocabTrainerModel.findByIdAndUpdate(req.params.id, {
            $set: {
                duration: req.body.duration,
                statusTest: statusResult,
                wordResults: newWordResults,
            },
            $inc: {
                countTime: 1,
            },
        }, { new: true }).lean());
        if (!result) {
            return res.status(404).json({ message: 'Failed to update VocabTrainer' });
        }
        yield clearRedisCache([
            ALL_VOCAB_TRAINER_CACHE_PREFIX,
            QUESTION_VOCAB_TRAINER_CACHE_PREFIX,
            VOCAB_TRAINER_CACHE_PREFIX,
        ]);
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
export const removeVocabTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield VocabTrainerModel.findByIdAndDelete(req.params.id);
        yield VocabReminderModel.findOneAndDelete({ vocabTrainer: req.params.id });
        yield clearRedisCache([
            ALL_VOCAB_TRAINER_CACHE_PREFIX,
            QUESTION_VOCAB_TRAINER_CACHE_PREFIX,
            VOCAB_TRAINER_CACHE_PREFIX,
        ]);
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
export const removeMultiVocabTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield VocabTrainerModel.deleteMany({
            _id: { $in: req.body },
        });
        yield clearRedisCache([
            ALL_VOCAB_TRAINER_CACHE_PREFIX,
            QUESTION_VOCAB_TRAINER_CACHE_PREFIX,
            VOCAB_TRAINER_CACHE_PREFIX,
        ]);
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
