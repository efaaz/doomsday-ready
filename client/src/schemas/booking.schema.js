import { z } from "zod";

export const bookingQuoteSchema = z.object({
  cinemaId: z.string().min(1, "Choose a cinema."),
  groupSize: z
    .string()
    .trim()
    .min(1, "Enter your group size.")
    .pipe(
      z.coerce
        .number()
        .int("Group size must be a whole number.")
        .min(1, "Group size must be at least 1.")
        .max(10000, "Group size cannot exceed 10,000."),
    ),
});
