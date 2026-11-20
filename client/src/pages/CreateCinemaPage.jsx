import { useState } from "react";
import { createCinema } from "../api/cinemas.api";
import { useToast } from "../hooks/useToast";
import { cinemaCreateSchema } from "../schemas/cinema.schema";

const initialForm = {
  name: "",
  bundleSizes: [""],
};

const initialErrors = {
  name: "",
  bundleSizes: [],
  bundleSizesGeneral: "",
};

function CreateCinemaPage({ onViewChange }) {
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState(initialErrors);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCinema, setCreatedCinema] = useState("");

  function handleNameChange(event) {
    setForm((current) => ({ ...current, name: event.target.value }));
    setFieldErrors((current) => ({ ...current, name: "" }));
    setCreatedCinema("");
    toast.clear();
  }

  function handleBundleSizeChange(index, value) {
    setForm((current) => ({
      ...current,
      bundleSizes: current.bundleSizes.map((size, itemIndex) =>
        itemIndex === index ? value : size,
      ),
    }));
    setFieldErrors((current) => ({
      ...current,
      bundleSizes: current.bundleSizes.map((message, itemIndex) =>
        itemIndex === index ? "" : message,
      ),
      bundleSizesGeneral: "",
    }));
    setCreatedCinema("");
    toast.clear();
  }

  function addBundleSize() {
    if (form.bundleSizes.length >= 10) return;

    setForm((current) => ({
      ...current,
      bundleSizes: [...current.bundleSizes, ""],
    }));
    setFieldErrors(initialErrors);
    setCreatedCinema("");
    toast.clear();
  }

  function removeBundleSize(index) {
    if (form.bundleSizes.length <= 1) return;

    setForm((current) => ({
      ...current,
      bundleSizes: current.bundleSizes.filter((_, itemIndex) => itemIndex !== index),
    }));
    setFieldErrors(initialErrors);
    setCreatedCinema("");
    toast.clear();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const result = cinemaCreateSchema.safeParse(form);

    if (!result.success) {
      const nextErrors = { ...initialErrors };

      result.error.issues.forEach((issue) => {
        const [field, index] = issue.path;

        if (field === "name" && !nextErrors.name) {
          nextErrors.name = issue.message;
        } else if (field === "bundleSizes" && Number.isInteger(index)) {
          nextErrors.bundleSizes[index] ||= issue.message;
        } else if (field === "bundleSizes" && !nextErrors.bundleSizesGeneral) {
          nextErrors.bundleSizesGeneral = issue.message;
        }
      });

      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors(initialErrors);
    setCreatedCinema("");
    setIsCreating(true);
    toast.clear();

    try {
      const response = await createCinema(result.data);
      const cinema = response?.data ?? response;
      setForm(initialForm);
      setCreatedCinema(cinema.name ?? result.data.name);
      toast.success("Cinema created successfully.");
    } catch (error) {
      toast.error(error, {
        title:
          error.code === "DUPLICATE_VALUE"
            ? "Cinema name already exists"
            : "Unable to create cinema",
        message:
          error.code === "DUPLICATE_VALUE"
            ? "A cinema with this name already exists. Choose a different name."
            : "The cinema could not be saved. Review the details and try again.",
      });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="create-cinema-page">
      <header className="create-cinema-header">
        <span className="movies-eyebrow">
          <span className="movies-eyebrow-dot" />
          WATCH PARTY SETUP
        </span>
        <h1>
          Add a cinema<span className="movies-title-dot">.</span>
        </h1>
        <p>
          Add a cinema and the seat bundles it sells. Those bundle sizes will be
          available when you build a booking quote.
        </p>
      </header>

      <div className="create-cinema-layout">
        <section
          className="create-cinema-panel"
          aria-labelledby="create-cinema-title"
        >
          <div className="create-cinema-panel-heading">
            <span className="create-cinema-step">01</span>
            <div>
              <h2 id="create-cinema-title">Cinema details</h2>
              <p>Enter its name and one or more unique bundle sizes.</p>
            </div>
          </div>

          <form className="create-cinema-form" onSubmit={handleSubmit} noValidate>
            <div className="movie-field">
              <label htmlFor="cinema-name">Cinema name</label>
              <input
                id="cinema-name"
                className="movie-input"
                type="text"
                value={form.name}
                onChange={handleNameChange}
                placeholder="For example, Central Cinema"
                disabled={isCreating}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "cinema-name-error" : undefined}
              />
              {fieldErrors.name && (
                <p
                  className="movie-field-error"
                  id="cinema-name-error"
                  role="alert"
                >
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div className="create-cinema-bundles-heading">
              <div>
                <h3>Seat bundle sizes</h3>
                <p>Each number is the number of seats in one bundle.</p>
              </div>
              <span>{form.bundleSizes.length} / 10</span>
            </div>

            <div className="create-cinema-bundle-list">
              {form.bundleSizes.map((size, index) => (
                <div className="create-cinema-bundle-row" key={index}>
                  <label htmlFor={`cinema-bundle-${index}`}>
                    Bundle {index + 1}
                  </label>
                  <input
                    id={`cinema-bundle-${index}`}
                    className="movie-input"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="500"
                    step="1"
                    value={size}
                    onChange={(event) =>
                      handleBundleSizeChange(index, event.target.value)
                    }
                    placeholder="e.g. 4"
                    disabled={isCreating}
                    aria-invalid={Boolean(fieldErrors.bundleSizes[index])}
                    aria-describedby={
                      fieldErrors.bundleSizes[index]
                        ? `cinema-bundle-error-${index}`
                        : undefined
                    }
                  />
                  <span className="create-cinema-seat-unit">seats</span>
                  <button
                    type="button"
                    className="create-cinema-remove-button"
                    onClick={() => removeBundleSize(index)}
                    disabled={isCreating || form.bundleSizes.length === 1}
                    aria-label={`Remove bundle ${index + 1}`}
                  >
                    Remove
                  </button>
                  {fieldErrors.bundleSizes[index] && (
                    <p
                      className="movie-field-error create-cinema-bundle-error"
                      id={`cinema-bundle-error-${index}`}
                      role="alert"
                    >
                      {fieldErrors.bundleSizes[index]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {fieldErrors.bundleSizesGeneral && (
              <p className="movie-field-error" role="alert">
                {fieldErrors.bundleSizesGeneral}
              </p>
            )}

            <button
              type="button"
              className="movie-button movie-button-secondary create-cinema-add-button"
              onClick={addBundleSize}
              disabled={isCreating || form.bundleSizes.length >= 10}
            >
              + Add another bundle size
            </button>

            <p className="create-cinema-form-hint">
              Add between 1 and 10 different sizes, from 1 to 500 seats each.
            </p>

            <button
              type="submit"
              className="movie-button movie-button-primary create-cinema-submit"
              disabled={isCreating}
            >
              {isCreating ? "Creating cinema..." : "Create cinema"}
            </button>
          </form>
        </section>

        <aside className="create-cinema-help-panel">
          <span className="create-cinema-help-icon" aria-hidden="true">
            #
          </span>
          <h2>How bundles work</h2>
          <p>
            A cinema sells seats in fixed-size bundles. For example, if it sells
            bundles of 2 and 5 seats, a group of 11 can be booked with three
            2-seat bundles and one 5-seat bundle.
          </p>
          <p>
            The booking page finds the exact combination with the fewest bundles.
          </p>
        </aside>
      </div>

      {createdCinema && (
        <div className="create-cinema-success-card" role="status">
          <div>
            <h2>{createdCinema} is ready for booking quotes</h2>
            <p>Its bundle sizes are now available in the booking page.</p>
          </div>
          <button
            type="button"
            className="movie-button movie-button-primary"
            onClick={() => onViewChange("booking")}
          >
            Get a booking quote
          </button>
        </div>
      )}
    </section>
  );
}

export default CreateCinemaPage;
