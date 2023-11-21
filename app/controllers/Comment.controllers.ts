import { CommentModel } from '../models/Comment.models.js';

export const getAllComment = async (req, res) => {
  try {
    const result = await CommentModel.find()
      .select('-product -_id -__v')
      .populate('userId');

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getComment = async (req, res) => {
  try {
    const result = await CommentModel.find({ product: req.params.id })
      .sort({ createdAt: -1 })
      .select('-product -_id -__v')
      .populate('userId');

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addToComment = async (req, res) => {
  try {
    const result = new CommentModel({
      userId: req.body.id,
      product: req.body.idProduct,
      content: req.body.content,
      rate: req.body.rate,
    }).save();

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateToComment = async (req, res) => {
  try {
    const result = await CommentModel.findByIdAndUpdate(req.params.id, {
      content: req.body.content,
      rate: req.body.rate,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeToComment = async (req, res) => {
  try {
    const result = await CommentModel.findByIdAndRemove(req.params.id);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
