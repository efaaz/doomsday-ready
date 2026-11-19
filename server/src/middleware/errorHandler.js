const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let code = err.code;
  let message = err.message || "Internal server error";

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_VALUE";
    message = "A record with this value already exists";
  }

  // Mongoose schema validation error
  else if (err.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = err.message;
  }

  // Invalid MongoDB ObjectId
  else if (err.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";
    message = "Invalid ID format";
  }

  res.status(statusCode).json({
    success: false,
    code: code || "INTERNAL_SERVER_ERROR",
    message
  });
};

export default errorHandler;
