import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("MongoDB connected successfully");
        }).catch((err) => {
            console.log("MongoDB connection failed", err);
        })
    } catch(error) {
        console.log("Error connecting to MongoDB", error);
    }
}

export default connectDB;