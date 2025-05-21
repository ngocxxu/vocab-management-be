import express from 'express';
import {
  addVocab,
  getAllVocab,
  getVocab,
  getAllVocabByOneSubject,
  randomVocab,
  removeMultiVocab,
  removeVocab,
  updateVocab,
  addMultiVocab,
} from '../controllers/Vocab.controllers.js';

const router = express.Router();

router.get('/', getAllVocab);

router.get('/:id', getVocab);

router.get('/subject/:subjectId', getAllVocabByOneSubject);

router.get('/random/:amount', randomVocab);

router.post('/', addVocab);

router.post('/bulk', addMultiVocab);

router.put('/:id', updateVocab);

router.delete('/:id', removeVocab);

router.post('/deleteIds', removeMultiVocab);

export default router;
