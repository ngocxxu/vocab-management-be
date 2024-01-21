import {
  removeVocab,
  updateVocab,
  addVocab,
  getVocab,
  getAllVocab,
  removeMultiVocab,
} from '../controllers/Vocab.controllers';
import express from 'express';

const router = express.Router();

router.get('/', getAllVocab);

router.get('/:id', getVocab);

router.post('/', addVocab);

router.put('/:id', updateVocab);

router.delete('/:id', removeVocab);

router.post('/deleteIds', removeMultiVocab);

export default router;
