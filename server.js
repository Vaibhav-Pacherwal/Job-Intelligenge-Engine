import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.Port || 8000;

const main = async () => {
    app.listen(port, () => {
        console.log(`server is running on port ${port}`);
    });
    await connectDB();
}

main();