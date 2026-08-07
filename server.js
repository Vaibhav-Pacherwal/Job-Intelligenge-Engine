import express from 'express';
import connectDB from './config/db.js';
import Job from './models/job.model.js';
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

const countJobs  = async () => {
    const totolJobs = await Job.countDocuments({ "status.summarized": true });
    console.log(`Total summarized jobs in the database: ${totolJobs}`);
}

countJobs();