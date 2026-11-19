import {
  buildAdjacencyGraph,
  hasCycle,
  getRewatchOrder
} from "../services/graph.service.js";

const movies = [
  {
    _id: "M1",
    title: "Iron Man",
    prerequisiteIds: []
  },
  {
    _id: "M2",
    title: "Captain America: The First Avenger",
    prerequisiteIds: []
  },
  {
    _id: "M3",
    title: "The Avengers",
    prerequisiteIds: ["M1", "M2"]
  },
  {
    _id: "M4",
    title: "Captain America: Civil War ",
    prerequisiteIds: ["M3"]
  },
  {
    _id: "M5",
    title: "Thor: Ragnarok ",
    prerequisiteIds: []
  },
  {
    _id: "M6",
    title: "Avengers: Infinity War",
    prerequisiteIds: ["M4", "M5"]
  },
  {
    _id: "M7",
    title: "Avengers: Endgame",
    prerequisiteIds: ["M6"]
  },
  {
    _id: "M8",
    title: "Avengers: Doomsday",
    prerequisiteIds: ["M7"]
  }

];

const graph = buildAdjacencyGraph(movies);

const movieMap = new Map(
  movies.map(movie => [movie._id, movie])
);

console.log("Cycle:", hasCycle(graph));

const order = getRewatchOrder("M8", graph, movieMap);

console.log(
  "Rewatch order:",
  order.map(movie => movie.title)
);

const cyclicMovies = [
  {
    _id: "A",
    prerequisiteIds: ["B"]
  },
  {
    _id: "B",
    prerequisiteIds: ["C"]
  },
  {
    _id: "C",
    prerequisiteIds: ["A"]
  }
];

const cyclicGraph = buildAdjacencyGraph(cyclicMovies);

console.log(hasCycle(cyclicGraph));






// node src/testing/test-graph.js