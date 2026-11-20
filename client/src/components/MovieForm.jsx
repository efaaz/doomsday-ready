import { useState } from "react";
import { useToast } from "../hooks/useToast";

const initialForm = {
  title: "",
  releaseYear: "",
  runtime: "",
  prerequisiteIds: [],
};

function MovieForm({ movies, schema, isSaving, onSubmit, onCancel }) {
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    toast.clear();
    setForm((current) => ({ ...current, [name]: value }));
    setFormErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function togglePrerequisite(id) {
    toast.clear();
    setForm((current) => ({
      ...current,
      prerequisiteIds: current.prerequisiteIds.includes(id)
        ? current.prerequisiteIds.filter((item) => item !== id)
        : [...current.prerequisiteIds, id],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const result = schema.safeParse(form);

    if (!result.success) {
      const nextErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string" && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      });

      setFormErrors(nextErrors);
      return;
    }

    setFormErrors({});

    if (await onSubmit(result.data)) {
      setForm(initialForm);
      onCancel();
    }
  }

  return (
    <div className="movie-form-panel">
      <div className="movie-form-heading">
        <span className="movies-eyebrow">NEW ENTRY</span>
        <h2>Add a movie</h2>
        <p>Enter the details and choose any movies to watch first.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="movie-form-grid">
          <div className="movie-field movie-field-full">
            <label htmlFor="movie-title">Movie title</label>
            <input
              id="movie-title"
              className="movie-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Avengers: Endgame"
              required
              maxLength={150}
              aria-invalid={Boolean(formErrors.title)}
              aria-describedby={formErrors.title ? "movie-title-error" : undefined}
            />
            {formErrors.title && (
              <p
                className="movie-field-error"
                id="movie-title-error"
                role="alert"
              >
                {formErrors.title}
              </p>
            )}
          </div>

          <div className="movie-field">
            <label htmlFor="release-year">Release year</label>
            <input
              id="release-year"
              className="movie-input"
              name="releaseYear"
              type="number"
              min="1900"
              max="2100"
              value={form.releaseYear}
              onChange={handleChange}
              placeholder="2019"
              required
              aria-invalid={Boolean(formErrors.releaseYear)}
              aria-describedby={
                formErrors.releaseYear ? "release-year-error" : undefined
              }
            />
            {formErrors.releaseYear && (
              <p
                className="movie-field-error"
                id="release-year-error"
                role="alert"
              >
                {formErrors.releaseYear}
              </p>
            )}
          </div>

          <div className="movie-field">
            <label htmlFor="runtime">Runtime (minutes)</label>
            <input
              id="runtime"
              className="movie-input"
              name="runtime"
              type="number"
              min="1"
              max="300"
              value={form.runtime}
              onChange={handleChange}
              placeholder="181"
              required
              aria-invalid={Boolean(formErrors.runtime)}
              aria-describedby={formErrors.runtime ? "runtime-error" : undefined}
            />
            {formErrors.runtime && (
              <p
                className="movie-field-error"
                id="runtime-error"
                role="alert"
              >
                {formErrors.runtime}
              </p>
            )}
          </div>
        </div>

        <div className="movie-prerequisites">
          <div className="movie-section-heading">
            <div>
              <h3>Prerequisite movies</h3>
              <p>Optional: select movies that should be watched first.</p>
            </div>
            <span className="movie-selection-count">
              {form.prerequisiteIds.length} selected
            </span>
          </div>

          {movies.length === 0 ? (
            <p className="movie-empty-prerequisites">
              Add other movies first to choose prerequisites.
            </p>
          ) : (
            <div className="movie-checkbox-list">
              {movies.map((movie) => (
                <label key={movie.id} className="movie-checkbox-option">
                  <input
                    type="checkbox"
                    className="movie-checkbox"
                    checked={form.prerequisiteIds.includes(movie.id)}
                    onChange={() => togglePrerequisite(movie.id)}
                  />
                  <span>{movie.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="movie-form-actions">
          <button
            type="button"
            className="movie-button movie-button-secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="movie-button movie-button-primary"
          >
            {isSaving ? "Saving..." : "Save movie"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MovieForm;
