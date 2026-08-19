import Job from "../models/job.model.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const filterJobs = async (parameters) => {
    const relevantJobs = await Job.find({
        $and: [
            {
                role: {
                    $regex: parameters.role,
                    $options: "i"
                }
            },
            {
                location: {
                    $regex: parameters.location,
                    $options: "i"
                }
            }
        ]
    });

    console.log(JSON.stringify(relevantJobs));

    return relevantJobs;
}

export default filterJobs;

