import mongoose from "mongoose";
import Cinema from "../models/cinema.model.js";
import { calculateMinimumBundles } from "./booking.service.js";
import { createError } from "../utils.js";

// Helper: Validate cinema ID

function validateCinemaId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid cinema ID", 400, "INVALID_CINEMA_ID");
  }

  return new mongoose.Types.ObjectId(id).toString();
}

// Helper: Validate cinema input

function validateCinemaInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createError("Invalid request body", 400, "INVALID_REQUEST_BODY");
  }

  // Reject unknown fields
  const allowedFields = ["name", "bundleSizes"];

  for (const key of Object.keys(body)) {
    if (!allowedFields.includes(key)) {
      throw createError(
        `Unknown cinema field: ${key}`,
        400,
        "INVALID_CINEMA_FIELD",
      );
    }
  }

  // Validate cinema name
  if (typeof body.name !== "string" || !body.name.trim()) {
    throw createError("Cinema name is required", 400, "INVALID_CINEMA_NAME");
  }

  // Validate bundleSizes array
  const { bundleSizes } = body;

  if (
    !Array.isArray(bundleSizes) ||
    bundleSizes.length < 1 ||
    bundleSizes.length > 10
  ) {
    throw createError(
      "Cinema must have between 1 and 10 bundle sizes",
      400,
      "INVALID_BUNDLE_SIZES",
    );
  }

  // Every bundle must be an integer between 1 and 500
  const validSizes = bundleSizes.every(
    (size) => Number.isInteger(size) && size >= 1 && size <= 500,
  );

  if (!validSizes) {
    throw createError(
      "Every bundle size must be an integer between 1 and 500",
      400,
      "INVALID_BUNDLE_SIZES",
    );
  }

  // Check duplicate bundle sizes
  if (new Set(bundleSizes).size !== bundleSizes.length) {
    throw createError(
      "Duplicate bundle sizes are not allowed",
      400,
      "DUPLICATE_BUNDLE_SIZES",
    );
  }

  return {
    name: body.name.trim(),
    bundleSizes,
  };
}

// Helper: Validate group size

function validateGroupSize(groupSize) {
  const size = Number(groupSize);

  if (!Number.isInteger(size) || size < 1 || size > 10000) {
    throw createError(
      "Group size must be an integer between 1 and 10,000",
      400,
      "INVALID_GROUP_SIZE",
    );
  }

  return size;
}

// 1. CREATE CINEMA

export async function createCinema(body) {
  // Validate incoming data
  const data = validateCinemaInput(body);

  // Check duplicate cinema name
  const existingCinema = await Cinema.findOne({
    name: data.name,
  })
    .select("_id")
    .lean();

  if (existingCinema) {
    throw createError(
      "A cinema with this name already exists",
      409,
      "DUPLICATE_CINEMA_NAME",
    );
  }

  // Save cinema to MongoDB
  const cinema = await Cinema.create(data);

  return cinema;
}

// 2. GET ALL CINEMAS

export async function getCinemas() {
  const cinemas = await Cinema.find().sort({ name: 1 }).lean();

  return cinemas;
}

// 3. GET BOOKING QUOTE

export async function getBookingQuote(cinemaId, groupSize) {
  // Validate cinema ID
  const id = validateCinemaId(cinemaId);

  // Validate customer group size
  const validatedGroupSize = validateGroupSize(groupSize);

  // Find cinema in MongoDB
  const cinema = await Cinema.findById(id).lean();

  if (!cinema) {
    throw createError("Cinema not found", 404, "CINEMA_NOT_FOUND");
  }

  // Get available bundle sizes from cinema
  const bundleSizes = cinema.bundleSizes;

  // Call the Dynamic Programming algorithm
  const quote = calculateMinimumBundles(bundleSizes, validatedGroupSize);

  // Return cinema information and booking result
  return {
    cinema: {
      id: cinema._id.toString(),
      name: cinema.name,
    },
    ...quote,
  };
}
