import { useMemo, useState } from "react";
import Loading from "../components/Loading";
import MovieCard from "../components/MovieCard";
import MovieForm from "../components/MovieForm";
import useMovies from "../hooks/useMovies";
import { movieCreateFormSchema } from "../schemas/movie.schema";

function getMovieId(movie) {
  return String(movie._id ?? movie.id);
}

function getMovieRuntime(movie) {
  return Number(movie.runtimeMinutes ?? movie.runtime ?? 0);
}

function getPrerequisiteIds(movie) {
  const prerequisites = movie.prerequisiteIds ?? movie.prerequisites ?? [];

  return prerequisites.map((item) =>
    typeof item === "object" ? String(item._id ?? item.id) : String(item),
  );
}

function formatRuntime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) return `${remaining} min`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

function StatCard({ label, value, detail, icon, accent = false }) {
  return (
    <div className="movie-stat-card">
      <div className="movie-stat-top">
        <span>{label}</span>
        <span
          className={`movie-stat-icon ${
            accent ? "movie-stat-icon-accent" : ""
          }`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <div className="movie-stat-value">{value}</div>
      <p>{detail}</p>
    </div>
  );
}

function MoviesPage() {
  const {
    movies,
    isLoading,
    isCreating,
    savingMovieIds,
    createMovie,
    updateWatched,
    updatePrerequisites,
  } = useMovies();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const watchedCount = movies.filter((movie) => movie.watched).length;
  const totalCount = movies.length;
  const remainingMinutes = movies
    .filter((movie) => !movie.watched)
    .reduce((total, movie) => total + getMovieRuntime(movie), 0);
  const progress =
    totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

  const movieOptions = useMemo(
    () =>
      movies.map((movie) => ({
        id: getMovieId(movie),
        title: movie.title,
      })),
    [movies],
  );

  const movieById = useMemo(
    () => new Map(movies.map((movie) => [getMovieId(movie), movie])),
    [movies],
  );

  const filteredMovies = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return movies.filter((movie) => {
      const matchesSearch = String(movie.title ?? "")
        .toLowerCase()
        .includes(searchTerm);
      const matchesFilter =
        filter === "all" ||
        (filter === "watched" && movie.watched) ||
        (filter === "unwatched" && !movie.watched);

      return matchesSearch && matchesFilter;
    });
  }, [filter, movies, search]);

  function clearFilters() {
    setSearch("");
    setFilter("all");
  }

  return (
    <section className="movies-page">
      <div className="movies-header">
        <div className="movies-heading">
          <span className="movies-eyebrow">
            <span className="movies-eyebrow-dot" />
            YOUR MCU COLLECTION
          </span>
          <h1>
            Movies<span className="movies-title-dot">.</span>
          </h1>
          <p>
            Build your watchlist, keep track of what you have seen, and know
            what to watch next.
          </p>
        </div>

        <button
          type="button"
          className="movie-button movie-button-primary"
          onClick={() => setShowForm((current) => !current)}
          aria-expanded={showForm}
          aria-controls="movie-create-form"
        >
          <span aria-hidden="true">{showForm ? "-" : "+"}</span>
          {showForm ? "Close form" : "Add a movie"}
        </button>
      </div>

      <div className="movies-stats">
        <StatCard
          label="In your list"
          value={totalCount}
          detail="Movies in your collection"
          icon="#"
        />
        <StatCard
          label="Watched"
          value={watchedCount}
          detail={`${progress}% of your list complete`}
          icon="✓"
          accent
        />
        <StatCard
          label="Time left"
          value={formatRuntime(remainingMinutes)}
          detail="Across unwatched movies"
          icon="◷"
        />
      </div>

      {totalCount > 0 && (
        <div className="movie-progress-panel">
          <div className="movie-progress-heading">
            <div>
              <h3>Your watch progress</h3>
              <p>
                {watchedCount} of {totalCount} movies watched
              </p>
            </div>
            <span>{progress}%</span>
          </div>
          <div
            className="movie-progress-track"
            role="progressbar"
            aria-label="Movie watch progress"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="movie-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {showForm && (
        <div id="movie-create-form">
          <MovieForm
            movies={movieOptions}
            schema={movieCreateFormSchema}
            isSaving={isCreating}
            onSubmit={createMovie}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="movie-collection">
        <div className="movie-collection-header">
          <div>
            <h2>Your collection</h2>
            <p role="status">
              {filteredMovies.length} of {totalCount} movies shown
            </p>
          </div>

          <div className="movie-toolbar-controls">
            <label className="movie-search-control">
              <span>Search</span>
              <input
                type="search"
                className="movie-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by movie title"
                aria-label="Search movies by title"
              />
            </label>

            <label className="movie-filter-control">
              <span>Show</span>
              <select
                className="movie-input"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter movies by watched status"
              >
                <option value="all">All movies</option>
                <option value="watched">Watched</option>
                <option value="unwatched">To watch</option>
              </select>
            </label>
          </div>
        </div>

        {isLoading ? (
          <Loading message="Loading your movie collection..." />
        ) : filteredMovies.length === 0 ? (
          <div className="movie-empty-state">
            <div className="movie-empty-icon" aria-hidden="true">
              {totalCount === 0 ? "M" : "⌕"}
            </div>
            <h3>
              {totalCount === 0
                ? "Your collection is empty"
                : "No movies match those filters"}
            </h3>
            <p>
              {totalCount === 0
                ? "Add your first movie to start building a watchlist."
                : "Try a different title or show all movies."}
            </p>
            {totalCount === 0 ? (
              <button
                type="button"
                className="movie-button movie-button-primary"
                onClick={() => setShowForm(true)}
              >
                Add your first movie
              </button>
            ) : (
              <button
                type="button"
                className="movie-button movie-button-secondary"
                onClick={clearFilters}
              >
                Clear search and filters
              </button>
            )}
          </div>
        ) : (
          <div className="movie-grid">
            {filteredMovies.map((movie, index) => {
              const id = getMovieId(movie);
              const prerequisiteIds = getPrerequisiteIds(movie);
              const prerequisiteNames = prerequisiteIds.map(
                (prerequisiteId) =>
                  movieById.get(prerequisiteId)?.title ?? "Unknown movie",
              );
              const prerequisiteOptions = movieOptions.filter(
                (option) => option.id !== id,
              );

              return (
                <MovieCard
                  key={id}
                  movie={movie}
                  index={index}
                  runtimeLabel={formatRuntime(getMovieRuntime(movie))}
                  prerequisiteIds={prerequisiteIds}
                  prerequisiteNames={prerequisiteNames}
                  prerequisiteOptions={prerequisiteOptions}
                  isSaving={savingMovieIds.has(id)}
                  onToggleWatched={() => updateWatched(movie)}
                  onSavePrerequisites={(ids) => updatePrerequisites(id, ids)}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default MoviesPage;
