import { useCallback, useEffect, useRef, useState } from "react";
import {
  createMovie as createMovieRequest,
  getMovies as getMoviesRequest,
  updateMovie as updateMovieRequest,
} from "../api/movies.api";

import { useToast } from "./useToast";

import {
  movieCreatePayloadSchema,
  moviePrerequisitesSchema,
  movieWatchedSchema,
} from "../schemas/movie.schema";

// Get MongoDB movie ID
function getMovieId(movie) {
  return String(movie._id);
}

export default function useMovies() {
  const toast = useToast();

  // State
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingMovieIds, setSavingMovieIds] = useState(new Set());
  const fetchMoviesRef = useRef(null);

  // Fetch movies
  const fetchMovies = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoading(true);

      try {
        const response = await getMoviesRequest();

        setMovies(response.data);

        return true;
      } catch (error) {
        toast.error(error, {
          title: "Unable to load movies",
          message: "Your movie collection could not be loaded.",
          onRetry: () => void fetchMoviesRef.current?.(),
        });

        return false;
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [toast],
  );

  // Keep the latest refresh callback available to the retry toast.
  useEffect(() => {
    fetchMoviesRef.current = fetchMovies;
  }, [fetchMovies]);

  // Initial fetch
  useEffect(() => {
    let isActive = true;

    getMoviesRequest()
      .then((response) => {
        if (isActive) setMovies(response.data);
      })
      .catch((error) => {
        if (!isActive) return;

        toast.error(error, {
          title: "Unable to load movies",
          message: "Your movie collection could not be loaded.",
          onRetry: () => void fetchMoviesRef.current?.(),
        });
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [toast]);

  // Create movie
  const createMovie = useCallback(
    async (movieData) => {
      toast.clear();

      const result = movieCreatePayloadSchema.safeParse(movieData);

      if (!result.success) {
        toast.error(new Error(result.error.issues[0]?.message), {
          title: "Invalid movie details",
        });

        return false;
      }

      setIsCreating(true);

      try {
        await createMovieRequest(result.data);

        await fetchMovies({ silent: true });

        toast.success("Movie created successfully.");

        return true;
      } catch (error) {
        toast.error(error, {
          title: "Unable to create movie",
          message: "The movie could not be saved. Please try again.",
        });

        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [fetchMovies, toast],
  );

  // Reusable update function
  const updateMovieRecord = useCallback(
    async (id, schema, updates, successMessage, errorOptions) => {
      toast.clear();

      const result = schema.safeParse(updates);

      if (!result.success) {
        toast.error(new Error(result.error.issues[0]?.message), {
          title: "Invalid movie update",
        });

        return false;
      }

      setSavingMovieIds((current) => new Set(current).add(id));

      try {
        await updateMovieRequest(id, result.data);

        await fetchMovies({ silent: true });

        toast.success(successMessage);

        return true;
      } catch (error) {
        toast.error(error, errorOptions);

        return false;
      } finally {
        setSavingMovieIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
    },
    [fetchMovies, toast],
  );

  // Update watched status
  const updateWatched = useCallback(
    (movie) => {
      const nextWatched = !movie.watched;

      return updateMovieRecord(
        getMovieId(movie),
        movieWatchedSchema,
        { watched: nextWatched },
        nextWatched ? "Movie marked as watched." : "Movie marked as unwatched.",
        {
          title: "Unable to update movie",
          message: "The watched status could not be updated.",
        },
      );
    },
    [updateMovieRecord],
  );

  // Update prerequisites
  const updatePrerequisites = useCallback(
    (id, prerequisiteIds) => {
      return updateMovieRecord(
        id,
        moviePrerequisitesSchema,
        { prerequisiteIds },
        "Movie prerequisites updated successfully.",
        {
          title: "Unable to update prerequisites",
          message: "The prerequisite changes could not be saved.",
        },
      );
    },
    [updateMovieRecord],
  );

  return {
    movies,
    isLoading,
    isCreating,
    savingMovieIds,
    refreshMovies: fetchMovies,
    createMovie,
    updateWatched,
    updatePrerequisites,
  };
}
