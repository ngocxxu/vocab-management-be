import express from 'express';
import {
  removeToVocabSubject,
  updateToVocabSubject,
  addToVocabSubject,
  getAllVocabSubject,
  reorderVocabSubject,
} from '../controllers/VocabSubject.controllers.js';

const router = express.Router();

router.get('/', getAllVocabSubject);

router.post('/', addToVocabSubject);

router.put('/:id', updateToVocabSubject);

router.patch('/reorder', reorderVocabSubject);

router.delete('/:id', removeToVocabSubject);

export default router;
