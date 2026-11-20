import { apiRequest } from "./api";

export const getCinemas = () => {
  return apiRequest("/cinemas");
};

export const createCinema = (cinemaData) => {
  return apiRequest("/cinemas", {
    method: "POST",
    body: JSON.stringify(cinemaData),
  });
};

export const getBookingQuote = (id, groupSize) => {
  return apiRequest(`/cinemas/${id}/booking?groupSize=${groupSize}`);
};
