import { calculateMinimumBundles } from "../services/booking.service.js";

// Test 1
console.log(calculateMinimumBundles([1, 3, 4], 6));

// Test 2
console.log(calculateMinimumBundles([2, 5], 11));

// Test 3
console.log(calculateMinimumBundles([6, 9, 20], 44));

// Test 4
console.log(calculateMinimumBundles([4, 6], 7));

// node src/testing/test-booking.js
