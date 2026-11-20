import { z } from "zod";

const bundleSizeInput = z
  .string()
  .trim()
  .min(1, "Enter a bundle size.")
  .pipe(
    z.coerce
      .number()
      .int("Bundle size must be a whole number.")
      .min(1, "Bundle size must be at least 1 seat.")
      .max(500, "Bundle size cannot exceed 500 seats."),
  );

export const cinemaCreateSchema = z
  .object({
    name: z.string().trim().min(1, "Cinema name is required."),
    bundleSizes: z
      .array(bundleSizeInput)
      .min(1, "Add at least one bundle size.")
      .max(10, "A cinema can have at most 10 bundle sizes."),
  })
  .superRefine(({ bundleSizes }, context) => {
    const seenSizes = new Set();

    bundleSizes.forEach((size, index) => {
      if (seenSizes.has(size)) {
        context.addIssue({
          code: "custom",
          path: ["bundleSizes", index],
          message: "Bundle sizes must be unique.",
        });
      }

      seenSizes.add(size);
    });
  })
  .transform(({ name, bundleSizes }) => ({
    name,
    bundleSizes,
  }));
