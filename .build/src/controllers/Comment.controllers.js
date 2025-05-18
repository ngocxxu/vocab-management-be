var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { handleError } from '../utils/utils.js';
import { CommentModel } from '../models/Comment.models.js';
export const getAllComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield CommentModel.find()
            .select('-product -_id -__v')
            .populate('userId');
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
export const getComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield CommentModel.find({ product: req.params.id })
            .sort({ createdAt: -1 })
            .select('-product -_id -__v')
            .populate('userId');
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
export const addToComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = new CommentModel({
            userId: req.body.id,
            product: req.body.idProduct,
            content: req.body.content,
            rate: req.body.rate,
        }).save();
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
export const updateToComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield CommentModel.findByIdAndUpdate(req.params.id, {
            content: req.body.content,
            rate: req.body.rate,
        });
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
export const removeToComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield CommentModel.findByIdAndDelete(req.params.id);
        res.status(200).json(result);
    }
    catch (err) {
        handleError(err, res);
    }
});
