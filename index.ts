import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import comment from './app/routers/Comment.routers.ts';
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

app.use('/api/comment', comment);
console.log('env: ', process.env.DATABSE_URL);
mongoose
  .connect(
    // process.env.DATABASE_URL ??
    'mongodb+srv://bono:ngoc25@cluster0.rbdq7.mongodb.net/vocab_management_db',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions
  )
  .then(() => {
    console.log('Connected to DB');
    app.listen(process.env.LOCAL_PORT, () => {
      console.log(`Server is running on port ${process.env.LOCAL_PORT}`);
    });
  })
  .catch((err) => {
    console.log('err', err);
  });
