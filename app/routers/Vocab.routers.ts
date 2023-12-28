import {
  removeVocab,
  updateVocab,
  addVocab,
  getVocab,
  getAllVocab,
} from '../controllers/Vocab.controllers.ts';
import express from 'express';

const router = express.Router();

router.get('/', getAllVocab);

router.get('/:id', getVocab);

router.post('/', addVocab);

router.put('/:id', updateVocab);

router.delete('/:id', removeVocab);

export default router;
