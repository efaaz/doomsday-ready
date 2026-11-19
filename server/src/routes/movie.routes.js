import express from "express";

import {
  createMovie,
  getMovies,
  updateMovie,
  getRewatchOrder,
} from "../controllers/movie.controller.js";

const router = express.Router();

// Create movie
router.post("/", createMovie);

// Get all movies
router.get("/", getMovies);

// Update movie
router.patch("/:id", updateMovie);

// Generate rewatch order
router.get("/:id/rewatch-order", getRewatchOrder);

export default router;
