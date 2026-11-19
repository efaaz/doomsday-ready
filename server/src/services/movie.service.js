import Movie from "../models/movie.model.js";

import {
  buildAdjacencyGraph,
  buildMovieMap,
  hasCycle,
  getRewatchOrder
} from "./graph.service.js";


const movies = await Movie.find().lean();

const graph = buildAdjacencyGraph(movies);

const movieMap = buildMovieMap(movies);