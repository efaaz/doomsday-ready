import * as movieService from "../services/movie.service.js";

// 1. CREATE MOVIE
export const createMovie = async (req, res, next) => {
  try {
    const movie = await movieService.createMovie(req.body);

    res.status(201).json({
      success: true,
      message: "Movie created successfully",
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET ALL MOVIES

export const getMovies = async (req, res, next) => {
  try {
    const movies = await movieService.getMovies();

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

// 3. UPDATE MOVIE

export const updateMovie = async (req, res, next) => {
  try {
    const updatedMovie = await movieService.updateMovie(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      data: updatedMovie,
    });
  } catch (error) {
    next(error);
  }
};

// 4. GENERATE REWATCH ORDER

export const getRewatchOrder = async (req, res, next) => {
  try {
    const rewatchPlan = await movieService.getRewatchPlan(req.params.id);

    res.status(200).json({
      success: true,
      data: rewatchPlan,
    });
  } catch (error) {
    next(error);
  }
};
