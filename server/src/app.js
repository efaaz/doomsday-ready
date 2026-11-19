import connectDB from "./config/db.js";
import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import movieRoutes from "./routes/movie.routes.js";
import cinemaRoutes from "./routes/cinema.route.js";

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});
// Routes
app.use("/api/movies", movieRoutes);
app.use("/api/cinemas", cinemaRoutes);




// check server health
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Doomsday API is running"
  });
});

// Handle unknown routes
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Error handling middleware
app.use(errorHandler);

export default app;

