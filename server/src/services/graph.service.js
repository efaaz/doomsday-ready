// Build adjacency graph from movie documents

export function buildAdjacencyGraph(movies) {
  const graph = new Map();

  for (const movie of movies) {
    const movieId = movie._id.toString();

    const prerequisites = (movie.prerequisiteIds || []).map((id) =>
      id.toString(),
    );

    graph.set(movieId, prerequisites);
  }

  return graph;
}

// Build movie lookup map for efficient access

export function buildMovieMap(movies) {
  const movieMap = new Map();

  for (const movie of movies) {
    movieMap.set(movie._id.toString(), movie);
  }

  return movieMap;
}

// DFS function for cycle detection and ordering

function dfs(node, graph, visited, pathVisited, onFinish = () => {}) {
  // Node is already in the current recursion path
  if (pathVisited.has(node)) {
    return true;
  }

  // Node has already been completely explored
  if (visited.has(node)) {
    return false;
  }

  // Mark node as visited and currently exploring
  visited.add(node);
  pathVisited.add(node);

  let cycleFound = false;

  // Explore all prerequisites
  for (const prerequisite of graph.get(node) ?? []) {
    if (dfs(prerequisite, graph, visited, pathVisited, onFinish)) {
      cycleFound = true;
      break;
    }
  }

  // Remove from current recursion path
  pathVisited.delete(node);

  // Stop if a cycle was found
  if (cycleFound) {
    return true;
  }

  // Execute after all prerequisites are processed
  onFinish(node);

  return false;
}

// Check whether the entire graph has a cycle 

export function hasCycle(graph) {
  const visited = new Set();
  const pathVisited = new Set();

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      if (dfs(node, graph, visited, pathVisited)) {
        return true;
      }
    }
  }

  return false;
}

// Generate rewatch order for a target movie, excluding the target itself. Throws an error if a cycle is detected.

export function getRewatchOrder(targetId, graph, movieMap) {
  if (!graph.has(targetId)) {
    throw new Error("Target movie not found");
  }

  const visited = new Set();
  const pathVisited = new Set();
  const result = [];

  // Callback executes after all prerequisites are processed
  const onFinish = (node) => {
    // Do not include the target movie
    if (node !== targetId) {
      const movie = movieMap.get(node);

      if (!movie) {
        throw new Error(`Movie not found: ${node}`);
      }

      result.push(movie);
    }
  };

  const cycleFound = dfs(targetId, graph, visited, pathVisited, onFinish);

  if (cycleFound) {
    const error = new Error("Circular dependency detected");
    error.statusCode = 409;
    error.code = "CIRCULAR_DEPENDENCY";

    throw error;
  }

  return result;
}
