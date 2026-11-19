
import mongoose from "mongoose";

let connectionPromise = null;

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Share only an in-flight connection attempt. A resolved promise must not be
  // cached: after a disconnect, a later request needs to create a new connection.
  if (connectionPromise) {
    await connectionPromise;
    return mongoose.connection;
  }

  const pendingConnection = mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  connectionPromise = pendingConnection;

  try {
    await pendingConnection;
    return mongoose.connection;
  } finally {
    if (connectionPromise === pendingConnection) {
      connectionPromise = null;
    }
  }
};

export default connectDB;
