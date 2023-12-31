import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import comment from './app/routers/Comment.routers.ts';
dotenv.config({ path: './.env' });
const app = express();

app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

app.use('/api/comment', comment);

mongoose
  .connect(process.env.DATABASE_URL ?? '', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions)
  .then(() => {
    console.log('Connected to DB');
    app.listen(process.env.LOCAL_PORT, () => {
      console.log(`Server is running on port ${process.env.LOCAL_PORT}`);
    });
  })
  .catch((err) => {
    console.log('err', err);
  });
