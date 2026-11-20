import { useState } from "react";
import { useToast } from "../hooks/useToast";

function MovieCard({
  movie,
  index,
  runtimeLabel,
  prerequisiteIds,
  prerequisiteNames,
  prerequisiteOptions,
  isSaving,
  onToggleWatched,
  onSavePrerequisites,
}) {
  const toast = useToast();
  const [isEditingPrerequisites, setIsEditingPrerequisites] = useState(false);
  const [editingPrerequisiteIds, setEditingPrerequisiteIds] = useState([]);

  function startEditing() {
    toast.clear();
    setEditingPrerequisiteIds(prerequisiteIds);
    setIsEditingPrerequisites(true);
  }

  function cancelEditing() {
    setEditingPrerequisiteIds([]);
    setIsEditingPrerequisites(false);
  }

  function togglePrerequisite(prerequisiteId) {
    toast.clear();
    setEditingPrerequisiteIds((current) =>
      current.includes(prerequisiteId)
        ? current.filter((item) => item !== prerequisiteId)
        : [...current, prerequisiteId],
    );
  }

  async function savePrerequisites() {
    if (await onSavePrerequisites(editingPrerequisiteIds)) {
      setIsEditingPrerequisites(false);
    }
  }

  return (
    <article className="movie-card">
      <div className="movie-card-cover">
        <div className="movie-card-cover-top">
          <span>DOOMSDAY READY</span>
          <span>{movie.releaseYear ?? "—"}</span>
        </div>
        <div className="movie-card-number">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="movie-card-decoration" />
      </div>

      <div className="movie-card-body">
        <div className="movie-card-title-row">
          <div className="movie-card-title">
            <h3>{movie.title}</h3>
            <p>{runtimeLabel}</p>
          </div>

          <span
            className={`movie-status ${
              movie.watched
                ? "movie-status-watched"
                : "movie-status-unwatched"
            }`}
          >
            {movie.watched ? "Watched" : "To watch"}
          </span>
        </div>

        <div className="movie-prerequisite-section">
          <div className="movie-prerequisite-heading">
            <span>WATCH THESE FIRST</span>
            <span>{prerequisiteIds.length}</span>
          </div>

          {isEditingPrerequisites ? (
            <div className="movie-edit-prerequisites">
              <p className="movie-edit-hint">
                Choose any movies that should come before this one.
              </p>
              {prerequisiteOptions.length === 0 ? (
                <p className="movie-empty-prerequisites">
                  Add another movie before setting prerequisites.
                </p>
              ) : (
                prerequisiteOptions.map((option) => (
                  <label key={option.id} className="movie-checkbox-option">
                    <input
                      type="checkbox"
                      className="movie-checkbox"
                      checked={editingPrerequisiteIds.includes(option.id)}
                      onChange={() => togglePrerequisite(option.id)}
                    />
                    <span>{option.title}</span>
                  </label>
                ))
              )}
              <div className="movie-edit-actions">
                <button
                  type="button"
                  className="movie-button movie-button-primary"
                  onClick={savePrerequisites}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save prerequisites"}
                </button>
                <button
                  type="button"
                  className="movie-button movie-button-secondary"
                  onClick={cancelEditing}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : prerequisiteNames.length > 0 ? (
            <div className="movie-prerequisite-tags">
              {prerequisiteNames.map((name, itemIndex) => (
                <span key={`${name}-${itemIndex}`}>{name}</span>
              ))}
            </div>
          ) : (
            <p className="movie-no-prerequisites">No prerequisites</p>
          )}
        </div>

        {!isEditingPrerequisites && (
          <div className="movie-card-actions">
            <button
              type="button"
              className={`movie-button ${
                movie.watched
                  ? "movie-button-secondary"
                  : "movie-button-watched"
              }`}
              onClick={onToggleWatched}
              disabled={isSaving}
            >
              {isSaving
                ? "Updating..."
                : movie.watched
                  ? "Mark unwatched"
                  : "Mark watched"}
            </button>
            <button
              type="button"
              className="movie-button movie-button-secondary movie-edit-button"
              onClick={startEditing}
              disabled={isSaving}
            >
              Edit prerequisites
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default MovieCard;
