import { z } from "zod";

const releaseYearInput = z
  .string()
  .trim()
  .min(1, "Release year is required.")
  .pipe(
    z.coerce
      .number()
      .int("Release year must be a whole number.")
      .min(1900, "Release year must be 1900 or later.")
      .max(2100, "Release year must be 2100 or earlier."),
  );

const runtimeInput = z
  .string()
  .trim()
  .min(1, "Runtime is required.")
  .pipe(
    z.coerce
      .number()
      .int("Runtime must be a whole number.")
      .min(1, "Runtime must be at least 1 minute.")
      .max(300, "Runtime cannot exceed 300 minutes."),
  );

export const movieCreateFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Movie title is required.")
      .max(150, "Movie title must be 150 characters or fewer."),
    releaseYear: releaseYearInput,
    runtime: runtimeInput,
    prerequisiteIds: z.array(z.string().min(1)),
  })
  .transform(({ runtime, ...movie }) => ({
    ...movie,
    runtimeMinutes: runtime,
  }));

export const movieCreatePayloadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Movie title is required.")
    .max(150, "Movie title must be 150 characters or fewer."),
  releaseYear: z.number().int().min(1900).max(2100),
  runtimeMinutes: z.number().int().min(1).max(300),
  prerequisiteIds: z.array(z.string().min(1)),
});

export const moviePrerequisitesSchema = z.object({
  prerequisiteIds: z.array(z.string().min(1)),
});

export const movieWatchedSchema = z.object({
  watched: z.boolean(),
});
