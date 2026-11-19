import { createError } from "../utils.js";

// Calculate Minimum Cinema Bundles

export function calculateMinimumBundles(bundleSizes, groupSize) {
  // 1. Validate group size
  const target = Number(groupSize);

  if (!Number.isInteger(target) || target < 1 || target > 10000) {
    throw createError(
      "Group size must be an integer between 1 and 10,000",
      400,
      "INVALID_GROUP_SIZE",
    );
  }

  // 2. Validate bundle sizes
  if (
    !Array.isArray(bundleSizes) ||
    bundleSizes.length < 1 ||
    bundleSizes.length > 10
  ) {
    throw createError(
      "A cinema must have between 1 and 10 bundle sizes",
      400,
      "INVALID_BUNDLE_SIZES",
    );
  }

  const validSizes = bundleSizes.every(
    (size) => Number.isInteger(size) && size >= 1 && size <= 500,
  );

  if (!validSizes) {
    throw createError(
      "Bundle sizes must be integers between 1 and 500",
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

  // 3. Initialize DP arrays

  // dp[x] = minimum bundles needed for exactly x seats
  const dp = Array(target + 1).fill(Infinity);

  // choice[x] = bundle size selected for x seats
  const choice = Array(target + 1).fill(-1);

  // Base case: 0 seats require 0 bundles
  dp[0] = 0;

  // 4. Bottom-up DP calculation

  for (let amount = 1; amount <= target; amount++) {
    for (const size of bundleSizes) {
      if (size <= amount) {
        const candidate = dp[amount - size] + 1;

        if (candidate < dp[amount]) {
          dp[amount] = candidate;

          // record which bundle produced the minimum
          choice[amount] = size;
        }
      }
    }
  }

  // 5. Check if an exact combination exists

  if (dp[target] === Infinity) {
    return {
      possible: false,
      groupSize: target,
      totalBundles: 0,
      bundles: [],
    };
  }

  // 6. Reconstruct selected bundle quantities

  const bundleCounts = new Map();

  let remainingSeats = target;

  while (remainingSeats > 0) {
    const selectedSize = choice[remainingSeats];

    if (selectedSize === -1) {
      throw new Error("Unable to reconstruct bundle combination");
    }

    // Count how many times each bundle is used
    const currentCount = bundleCounts.get(selectedSize) || 0;

    bundleCounts.set(selectedSize, currentCount + 1);

    // Reduce remaining seats
    remainingSeats -= selectedSize;
  }

  // 7. Format the final bundle information

  const bundles = Array.from(bundleCounts, ([size, quantity]) => ({
    size,
    quantity,
  })).sort((a, b) => b.size - a.size);

  // 8. Return final result

  return {
    possible: true,
    groupSize: target,
    totalBundles: dp[target],
    bundles,
  };
}
