import { apiRequest } from "./api";

export const getMovies = () => {
  return apiRequest("/movies");
};

export const createMovie = (movieData) => {
  return apiRequest("/movies", {
    method: "POST",
    body: JSON.stringify(movieData),
  });
};

export const updateMovie = (id, updates) => {
  return apiRequest(`/movies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
};

export const getRewatchOrder = (id) => {
  return apiRequest(`/movies/${id}/rewatch-order`);
};
