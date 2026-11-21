import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Movie from "../models/movie.model.js";

// Sample movies for a fresh local database.
// prerequisiteTitles are converted into MongoDB ObjectIds below.
const movieSeedData = [
  {
    title: "Iron Man",
    releaseYear: 2008,
    runtimeMinutes: 126,
    prerequisiteTitles: [],
  },
  {
    title: "Thor: Ragnarok",
    releaseYear: 2011,
    runtimeMinutes: 115,
    prerequisiteTitles: [],
  },
  {
    title: "Captain America: The First Avenger",
    releaseYear: 2011,
    runtimeMinutes: 124,
    prerequisiteTitles: [],
  },
  {
    title: "The Avengers",
    releaseYear: 2012,
    runtimeMinutes: 143,
    prerequisiteTitles: [
      "Iron Man",
      "Captain America: The First Avenger",
    ],
  },
  {
    title: "Captain America: Civil War",
    releaseYear: 2016,
    runtimeMinutes: 148,
    prerequisiteTitles: [
      "The Avengers",
    ],
  },
  {
    title: "Avengers: Infinity War",
    releaseYear: 2018,
    runtimeMinutes: 148,
    prerequisiteTitles: [
      "Captain America: Civil War",
      "Thor: Ragnarok",
    ],
  },
  {
    title: "Avengers: Endgame",
    releaseYear: 2019,
    runtimeMinutes: 181,
    prerequisiteTitles: [
        "Avengers: Infinity War"
    ],
  },
  {
    title: "Avengers: Doomsday",
    releaseYear: 2027,
    runtimeMinutes: 180,
    prerequisiteTitles: [
        "Avengers: Endgame"
    ],
  },
];

const seedMovies = async () => {
  const existingMovieCount = await Movie.countDocuments();

  // Don't insert the sample data again if movies already exist.
  if (existingMovieCount > 0) {
    console.log("Movie seed skipped: movies already exist.");
    return;
  }

  // Generate IDs first so prerequisite references can use them.
  const movieIds = new Map(
    movieSeedData.map((movie) => [
      movie.title,
      new mongoose.Types.ObjectId(),
    ])
  );

  const movies = movieSeedData.map((movie) => {
    const { prerequisiteTitles, ...movieFields } = movie;

    return {
      _id: movieIds.get(movie.title),
      ...movieFields,
      prerequisiteIds: prerequisiteTitles.map((title) => {
        const prerequisiteId = movieIds.get(title);

        if (!prerequisiteId) {
          throw new Error(`Unknown prerequisite movie: ${title}`);
        }

        return prerequisiteId;
      }),
      watched: false,
    };
  });

  await Movie.insertMany(movies);

  console.log(`Successfully seeded ${movies.length} movies.`);
};

const runSeed = async () => {
  try {
    await connectDB();
    await seedMovies();
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

runSeed();