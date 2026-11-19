import express from "express";
import {
  createCinema,
  getCinemas,
  getBookingQuote,
} from "../controllers/cinema.controller.js";

const router = express.Router();

// Create cinema
router.post("/", createCinema);

// Get all cinemas
router.get("/", getCinemas);

// Calculate booking quote
router.get("/:id/booking", getBookingQuote);

export default router;
