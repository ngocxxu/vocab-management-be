import {
  removeVocab,
  updateVocab,
  addVocab,
  getVocab,
  getAllVocab,
  removeMultiVocab,
  randomVocab,
} from '../controllers/Vocab.controllers';
import express from 'express';

const router = express.Router();

router.get('/', getAllVocab);

router.get('/:id', getVocab);

router.get('/random/:amount', randomVocab);

router.post('/', addVocab);

router.put('/:id', updateVocab);

router.delete('/:id', removeVocab);

router.post('/deleteIds', removeMultiVocab);

export default router;
