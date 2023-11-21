import express from 'express';
import {
  removeToComment,
  updateToComment,
  addToComment,
  getComment,
  getAllComment,
} from '../controllers/Comment.controllers.js';

const router = express.Router();

router.get('/', getAllComment);

router.get('/:id', getComment);

router.post('/', addToComment);

router.put('/:id', updateToComment);

router.delete('/:id', removeToComment);

export default router;
