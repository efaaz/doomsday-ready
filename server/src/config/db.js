
import mongoose from "mongoose";

let connectionPromise = null;

const connectDB = async () => {

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  // Reuse an existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Reuse an ongoing connection attempt
  if (!connectionPromise) {

    connectionPromise = mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 10000
      }
    ).catch((error) => {

      // Allow future requests to retry after failure
      connectionPromise = null;

      throw error;
    });
  }

  await connectionPromise;

  return mongoose.connection;
};

export default connectDB;
