import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

if (!process.env.MONGODB_URL) {
  throw new Error("please provide MONGODB_URL in the .env file");
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
