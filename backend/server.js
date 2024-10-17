import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './db/mongo.js';
import rulesRouter from './routes/rules.js';

const app = express();
app.use(cors());
app.use(express.json());
connectDB();

app.use('/api', rulesRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});