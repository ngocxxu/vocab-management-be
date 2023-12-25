import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import comment from './app/routers/Comment.routers.ts';
dotenv.config();
const app = express();

mongoose
  .connect(
    'mongodb+srv://bono:ngoc25@cluster0.rbdq7.mongodb.net/vocab_management_db'
  )
  .then(() => {
    console.log('Connected to DB');
    app.listen(4030, () => {
      console.log(`Server is running on port 4030`);
    });
  })
  .catch((err) => {
    console.log('err', err);
  });
