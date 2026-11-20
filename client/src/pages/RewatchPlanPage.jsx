import { useState } from "react";
import { getRewatchOrder } from "../api/movies.api";
import Loading from "../components/Loading";
import useMovies from "../hooks/useMovies";
import { useToast } from "../hooks/useToast";

function getMovieId(movie) {
  return String(movie._id ?? movie.id);
}

function formatRuntime(minutes = 0) {
  const totalMinutes = Number(minutes) || 0;
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

function RewatchPlanPage() {
  const toast = useToast();
  const { movies, isLoading, savingMovieIds, updateWatched } = useMovies();
  const [targetMovieId, setTargetMovieId] = useState("");
  const [rewatchPlan, setRewatchPlan] = useState(null);
  const [isBuildingPlan, setIsBuildingPlan] = useState(false);

  async function buildPlan(movieId = targetMovieId) {
    if (!movieId) return false;

    setIsBuildingPlan(true);

    try {
      const response = await getRewatchOrder(movieId);
      setRewatchPlan(response?.data ?? response);
      return true;
    } catch (error) {
      setRewatchPlan(null);
      toast.error(error, {
        title: "Unable to build rewatch plan",
        message: "The watch order could not be loaded. Please try again.",
      });
      return false;
    } finally {
      setIsBuildingPlan(false);
    }
  }

  async function handleBuildPlan(event) {
    event.preventDefault();
    await buildPlan();
  }

  async function handleWatchedChange(movie) {
    const updated = await updateWatched({
      _id: movie.id,
      watched: movie.watched,
    });

    if (updated && targetMovieId) {
      await buildPlan(targetMovieId);
    }
  }

  const orderedMovies = rewatchPlan?.movies ?? [];
  const summary = rewatchPlan?.summary ?? {};
  const totalMovies = summary.totalMovies ?? orderedMovies.length;
  const watchedMovies = summary.watchedMovies ?? 0;
  const remainingMovies =
    summary.remainingMovies ?? Math.max(0, totalMovies - watchedMovies);
  const progress =
    totalMovies > 0 ? Math.round((watchedMovies / totalMovies) * 100) : 0;

  return (
    <section className="rewatch-page">
      <header className="rewatch-header">
        <span className="movies-eyebrow">
          <span className="movies-eyebrow-dot" />
          YOUR NEXT MCU MARATHON
        </span>
        <h1>
          Rewatch plan<span className="movies-title-dot">.</span>
        </h1>
        <p>
          Choose a movie and get its prerequisites in watch order, with your
          progress and remaining time in one place.
        </p>
      </header>

      <section
        className="rewatch-picker-panel"
        aria-labelledby="rewatch-picker-title"
      >
        <div className="rewatch-picker-copy">
          <h2 id="rewatch-picker-title">Where do you want to start?</h2>
          <p>
            The plan includes movies you need to watch first and leaves out the
            target movie itself.
          </p>
        </div>

        {isLoading ? (
          <Loading message="Loading your movies..." />
        ) : movies.length === 0 ? (
          <div className="rewatch-no-movies">
            <p>Add movies to your collection before building a rewatch plan.</p>
          </div>
        ) : (
          <form className="rewatch-picker-form" onSubmit={handleBuildPlan}>
            <label className="rewatch-target-control">
              <span>Target movie</span>
              <select
                className="movie-input"
                value={targetMovieId}
                disabled={isBuildingPlan}
                onChange={(event) => {
                  setTargetMovieId(event.target.value);
                  setRewatchPlan(null);
                }}
                required
                aria-label="Choose a target movie"
              >
                <option value="">Choose a movie</option>
                {movies.map((movie) => (
                  <option key={getMovieId(movie)} value={getMovieId(movie)}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="movie-button movie-button-primary"
              disabled={!targetMovieId || isBuildingPlan}
            >
              {isBuildingPlan ? "Building plan..." : "Build my plan"}
            </button>
          </form>
        )}
      </section>

      {rewatchPlan && (
        <section className="rewatch-results" aria-live="polite">
          <div className="rewatch-results-heading">
            <div>
              <span className="rewatch-kicker">WATCH THESE FIRST</span>
              <h2>Before {rewatchPlan.targetMovie?.title}</h2>
              <p>
                Follow the list from top to bottom. Every prerequisite appears
                before the movie that depends on it.
              </p>
            </div>
            <span className="rewatch-step-count">
              {totalMovies} {totalMovies === 1 ? "movie" : "movies"}
            </span>
          </div>

          <div className="rewatch-summary">
            <SummaryCard
              label="Watched"
              value={`${watchedMovies} / ${totalMovies}`}
              detail="Prerequisites complete"
              accent
            />
            <SummaryCard
              label="Still to watch"
              value={remainingMovies}
              detail="Movies remaining"
            />
            <SummaryCard
              label="Time remaining"
              value={formatRuntime(summary.remainingRuntimeMinutes)}
              detail="Unwatched runtime"
            />
          </div>

          {totalMovies > 0 ? (
            <div className="rewatch-progress-panel">
              <div className="rewatch-progress-heading">
                <div>
                  <h3>Your progress</h3>
                  <p>
                    {watchedMovies} of {totalMovies} prerequisites watched
                  </p>
                </div>
                <span>{progress}%</span>
              </div>
              <div
                className="rewatch-progress-track"
                role="progressbar"
                aria-label="Rewatch plan progress"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="rewatch-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="rewatch-empty-plan">
              <span className="rewatch-empty-icon" aria-hidden="true">
                ✓
              </span>
              <h3>No prerequisite movies</h3>
              <p>
                You can watch {rewatchPlan.targetMovie?.title} without watching
                another movie first.
              </p>
            </div>
          )}

          {totalMovies > 0 && (
            <ol className="rewatch-list">
              {orderedMovies.map((movie, index) => {
                const isSaving = savingMovieIds.has(String(movie.id));

                return (
                  <li
                    className={`rewatch-step ${
                      movie.watched ? "rewatch-step-watched" : ""
                    }`}
                    key={movie.id}
                  >
                    <span className="rewatch-step-number" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="rewatch-step-details">
                      <h3>{movie.title}</h3>
                      <p>
                        {movie.releaseYear} <span aria-hidden="true">·</span>{" "}
                        {formatRuntime(movie.runtimeMinutes)}
                      </p>
                    </div>
                    <label className="rewatch-watched-control">
                      <input
                        type="checkbox"
                        checked={Boolean(movie.watched)}
                        disabled={isSaving}
                        onChange={() => handleWatchedChange(movie)}
                        aria-label={`Mark ${movie.title} as ${movie.watched ? "unwatched" : "watched"}`}
                      />
                      <span>{isSaving ? "Saving..." : "Watched"}</span>
                    </label>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}
    </section>
  );
}

function SummaryCard({ label, value, detail, accent = false }) {
  return (
    <div className="rewatch-summary-card">
      <div className="rewatch-summary-top">
        <span>{label}</span>
        {accent && (
          <span className="rewatch-summary-check" aria-hidden="true">
            ✓
          </span>
        )}
      </div>
      <div className="rewatch-summary-value">{value}</div>
      <p>{detail}</p>
    </div>
  );
}

export default RewatchPlanPage;
