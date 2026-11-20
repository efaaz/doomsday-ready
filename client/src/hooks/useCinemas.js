import { useCallback, useEffect, useRef, useState } from "react";
import {
  createCinema as createCinemaRequest,
  getBookingQuote as getBookingQuoteRequest,
  getCinemas as getCinemasRequest,
} from "../api/cinemas.api";
import { useToast } from "./useToast";
import { bookingQuoteSchema } from "../schemas/booking.schema";
import { cinemaCreateSchema } from "../schemas/cinema.schema";
function getCinemaArray(response) {
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

export default function useCinemas() {
  const toast = useToast();
  const [cinemas, setCinemas] = useState([]);
  const [isLoadingCinemas, setIsLoadingCinemas] = useState(true);
  const [isCreatingCinema, setIsCreatingCinema] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quote, setQuote] = useState(null);

  const refreshCinemas = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoadingCinemas(true);

      try {
        const response = await getCinemasRequest();
        setCinemas(getCinemaArray(response));
        return true;
      } catch (error) {
        toast.error(error, {
          title: "Unable to load cinemas",
          message:
            "The available cinemas could not be loaded. Please try again.",
          onRetry: () => void refreshCinemas(),
        });
        return false;
      } finally {
        if (!silent) setIsLoadingCinemas(false);
      }
    },
    [toast],
  );


 useEffect(() => {
  void refreshCinemas();
}, [refreshCinemas]);

  const createCinema = useCallback(
    async (cinemaData) => {
      toast.clear();

      const result = cinemaCreateSchema.safeParse(cinemaData);
      if (!result.success) {
        toast.error(new Error(result.error.issues[0]?.message), {
          title: "Invalid cinema details",
        });
        return null;
      }

      setIsCreatingCinema(true);

      try {
        const response = await createCinemaRequest(result.data);
        const cinema = response?.data ?? response;
        await refreshCinemas(true);
        toast.success("Cinema created successfully.");
        return cinema;
      } catch (error) {
        toast.error(error, {
          title:
            error.code === "DUPLICATE_VALUE"
              ? "Cinema name already exists"
              : "Unable to create cinema",
          message:
            error.code === "DUPLICATE_VALUE"
              ? "A cinema with this name already exists. Choose a different name."
              : "The cinema could not be saved. Review the details and try again.",
        });
        return null;
      } finally {
        setIsCreatingCinema(false);
      }
    },
    [refreshCinemas, toast],
  );

  const getBookingQuote = useCallback(
    async (cinemaId, groupSize) => {
      toast.clear();

      const result = bookingQuoteSchema.safeParse({
        cinemaId,
        groupSize: String(groupSize),
      });
      if (!result.success) {
        toast.error(new Error(result.error.issues[0]?.message), {
          title: "Invalid booking details",
        });
        return null;
      }

      setQuote(null);
      setIsLoadingQuote(true);

      try {
        const response = await getBookingQuoteRequest(
          result.data.cinemaId,
          result.data.groupSize,
        );
        const bookingQuote = response?.data ?? response;
        setQuote(bookingQuote);
        return bookingQuote;
      } catch (error) {
        toast.error(error, {
          title: "Unable to calculate a booking quote",
          message:
            "The seat combination could not be calculated. Please try again.",
        });
        return null;
      } finally {
        setIsLoadingQuote(false);
      }
    },
    [toast],
  );

  const clearBookingQuote = useCallback(() => {
    setQuote(null);
    toast.clear();
  }, [toast]);

  return {
    cinemas,
    isLoadingCinemas,
    isCreatingCinema,
    isLoadingQuote,
    quote,
    refreshCinemas,
    createCinema,
    getBookingQuote,
    clearBookingQuote,
  };
}
