import mongoose from "mongoose";
import Movie from "../models/movie.model.js";
import {
  buildAdjacencyGraph,
  buildMovieMap,
  hasCycle,
  getRewatchOrder,
} from "./graph.service.js";
import { createError } from "../utils.js";


// Helper: Validate MongoDB ID

function validateMovieId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid movie ID", 400, "INVALID_MOVIE_ID");
  }

  return new mongoose.Types.ObjectId(id).toString();
}

// Helper: Validate and normalize prerequisites

function normalizePrerequisiteIds(ids) {
  if (!Array.isArray(ids)) {
    throw createError(
      "Prerequisite IDs must be an array",
      400,
      "INVALID_PREREQUISITES",
    );
  }

  const normalizedIds = ids.map((id) => {
    if (!mongoose.isValidObjectId(id)) {
      throw createError(
        `Invalid prerequisite movie ID: ${id}`,
        400,
        "INVALID_PREREQUISITE_ID",
      );
    }

    return id.toString();
  });

  // Prevent duplicate prerequisites
  if (new Set(normalizedIds).size !== normalizedIds.length) {
    throw createError(
      "Duplicate prerequisites are not allowed",
      400,
      "DUPLICATE_PREREQUISITES",
    );
  }

  return normalizedIds;
}

// Helper: Validate graph references

function validateGraphReferences(graph) {
  for (const [movieId, prerequisites] of graph) {
    for (const prerequisiteId of prerequisites) {
      if (!graph.has(prerequisiteId)) {
        throw createError(
          `Movie ${movieId} references a non-existent prerequisite`,
          400,
          "INVALID_PREREQUISITE",
        );
      }
    }
  }
}

// Helper: Validate complete candidate graph

function validateCandidateGraph(movies) {
  const graph = buildAdjacencyGraph(movies);

  validateGraphReferences(graph);

  if (hasCycle(graph)) {
    throw createError(
      "Circular dependency detected",
      409,
      "CIRCULAR_DEPENDENCY",
    );
  }

  return graph;
}

// Helper: Check duplicate movie title

async function checkDuplicateTitle(title, excludeId = null) {
  const filter = {
    title,
    ...(excludeId && {
      _id: { $ne: excludeId },
    }),
  };

  const existingMovie = await Movie.findOne(filter).select("_id").lean();

  if (existingMovie) {
    throw createError(
      "A movie with this title already exists",
      409,
      "DUPLICATE_MOVIE_TITLE",
    );
  }
}

// 1. CREATE MOVIE

export async function createMovie(body) {
  if (typeof body.title !== "string" || body.title.trim() === "") {
    throw createError("Movie title is required", 400, "INVALID_TITLE");
  }

  if (!Number.isInteger(body.releaseYear) || body.releaseYear < 1) {
    throw createError(
      "Release year must be a valid positive integer",
      400,
      "INVALID_RELEASE_YEAR",
    );
  }


  if (
    !Number.isInteger(body.runtimeMinutes) ||
    body.runtimeMinutes < 1 ||
    body.runtimeMinutes > 300
  ) {
    throw createError(
      "Runtime must be between 1 and 300 minutes",
      400,
      "INVALID_RUNTIME",
    );
  }

  const data = {
    title: body.title.trim(),
    releaseYear: body.releaseYear,
    runtimeMinutes: body.runtimeMinutes,
    prerequisiteIds: body.prerequisiteIds || [],
    watched: body.watched ?? false,
  };

  await checkDuplicateTitle(data.title);

  // Create document in memory. MongoDB has not saved it yet.
  const newMovie = new Movie(data);

  // Fetch existing movies
  const existingMovies = await Movie.find().lean();

  // Construct a candidate graph including the new movie
  const candidateMovies = [...existingMovies, newMovie.toObject()];

  // Validate all dependencies before saving
  validateCandidateGraph(candidateMovies);

  // Save only after successful validation
  return await newMovie.save();
}

// 2. GET ALL MOVIES

export async function getMovies() {
  return await Movie.find().sort({ title: 1 }).lean();
}

// 3. UPDATE MOVIE

export async function updateMovie(movieId, body) {
  const id = validateMovieId(movieId);

  // Find existing movie
  const movieDocument = await Movie.findById(id);

  if (!movieDocument) {
    throw createError("Movie not found", 404, "MOVIE_NOT_FOUND");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createError("Invalid request body", 400, "INVALID_REQUEST_BODY");
  }

  const updates = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim() === "") {
      throw createError("Movie title is required", 400, "INVALID_TITLE");
    }
    updates.title = body.title.trim();
  }

  if (body.releaseYear !== undefined) {
    if (!Number.isInteger(body.releaseYear) || body.releaseYear < 1) {
      throw createError(
        "Release year must be a valid positive integer",
        400,
        "INVALID_RELEASE_YEAR",
      );
    }
    updates.releaseYear = body.releaseYear;
  }

  if (body.runtimeMinutes !== undefined) {
    if (
      !Number.isInteger(body.runtimeMinutes) ||
      body.runtimeMinutes < 1 ||
      body.runtimeMinutes > 300
    ) {
      throw createError(
        "Runtime must be between 1 and 300 minutes",
        400,
        "INVALID_RUNTIME",
      );
    }
    updates.runtimeMinutes = body.runtimeMinutes;
  }

  if (body.prerequisiteIds !== undefined) {
    updates.prerequisiteIds = normalizePrerequisiteIds(body.prerequisiteIds);
  }

  if (body.watched !== undefined) {
    if (typeof body.watched !== "boolean") {
      throw createError(
        "Watched must be a boolean",
        400,
        "INVALID_WATCHED_STATUS",
      );
    }
    updates.watched = body.watched;
  }

  if (Object.keys(updates).length === 0) {
    throw createError(
      "No valid fields provided for update",
      400,
      "EMPTY_UPDATE",
    );
  }

  // Check whether updated title already exists
  if (updates.title) {
    await checkDuplicateTitle(updates.title, id);
  }

  // Fetch all existing movies
  const existingMovies = await Movie.find().lean();

  // Create candidate movie data with proposed changes
  const candidateMovies = existingMovies.map((movie) => {
    if (movie._id.toString() === id) {
      return {
        ...movie,
        ...updates,
      };
    }

    return movie;
  });

  // Validate candidate graph before database update
  validateCandidateGraph(candidateMovies);

  // Apply changes to actual document
  Object.assign(movieDocument, updates);

  return await movieDocument.save();
}

// 4. GENERATE REWATCH ORDER

export async function getRewatchPlan(movieId) {
  const targetId = validateMovieId(movieId);

  // Fetch all movies
  const movies = await Movie.find().lean();

  // Build graph and movie lookup map
  const graph = buildAdjacencyGraph(movies);
  const movieMap = buildMovieMap(movies);

  // Find target movie
  const targetMovie = movieMap.get(targetId);

  if (!targetMovie) {
    throw createError("Target movie not found", 404, "MOVIE_NOT_FOUND");
  }

  // Validate graph references
  validateGraphReferences(graph);

  // DFS: Generate prerequisite-first ordering
  // This also detects cycles in the target's dependency path
  const orderedMovies = getRewatchOrder(targetId, graph, movieMap);

  // Calculate watched count
  const watchedMovies = orderedMovies.filter((movie) => movie.watched).length;

  // Calculate unwatched runtime
  const remainingRuntimeMinutes = orderedMovies.reduce((total, movie) => {
    return total + (movie.watched ? 0 : movie.runtimeMinutes);
  }, 0);

  const totalMovies = orderedMovies.length;

  return {
    targetMovie: {
      id: targetId,
      title: targetMovie.title,
    },

    movies: orderedMovies.map((movie) => ({
      id: movie._id.toString(),
      title: movie.title,
      releaseYear: movie.releaseYear,
      runtimeMinutes: movie.runtimeMinutes,
      watched: movie.watched,
    })),

    summary: {
      totalMovies,
      watchedMovies,
      remainingMovies: totalMovies - watchedMovies,
      remainingRuntimeMinutes,
    },
  };
}
