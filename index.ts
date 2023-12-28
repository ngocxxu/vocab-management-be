import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import comment from './app/routers/Comment.routers';
import vocab from './app/routers/Vocab.routers';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

app.use('/api/comment', comment);
app.use('/api/vocab', vocab);

mongoose
  .connect(process.env.DATABASE_URL || '')
  .then(() => {
    console.log('Connected to DB');
    app.listen(4030, () => {
      console.log(`Server is running on port 4030`);
    });
  })
  .catch((err) => {
    console.log('err', err);
  });
