import { useMemo, useState } from "react";
import Loading from "../components/Loading";
import useCinemas from "../hooks/useCinemas";
import { bookingQuoteSchema } from "../schemas/booking.schema";

function BookingPage({ onViewChange }) {
  const {
    cinemas,
    isLoadingCinemas,
    isLoadingQuote,
    quote,
    getBookingQuote,
    clearBookingQuote,
  } = useCinemas();
  const [cinemaId, setCinemaId] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const selectedCinema = useMemo(
    () =>
      cinemas.find((cinema) => String(cinema._id ?? cinema.id) === cinemaId),
    [cinemas, cinemaId],
  );

  function handleCinemaChange(event) {
    setCinemaId(event.target.value);
    clearBookingQuote();
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.cinemaId;
      return next;
    });
  }

  function handleGroupSizeChange(event) {
    setGroupSize(event.target.value);
    clearBookingQuote();
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.groupSize;
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const result = bookingQuoteSchema.safeParse({ cinemaId, groupSize });

    if (!result.success) {
      const nextErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string" && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      });
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    await getBookingQuote(result.data.cinemaId, result.data.groupSize);
  }

  const availableBundleSizes = selectedCinema?.bundleSizes ?? [];
  const totalSeats = quote?.bundles?.reduce(
    (total, bundle) => total + bundle.size * bundle.quantity,
    0,
  );

  return (
    <section className="booking-page">
      <header className="booking-header">
        <span className="movies-eyebrow">
          <span className="movies-eyebrow-dot" />
          OPENING NIGHT PLANNER
        </span>
        <h1>
          Booking quote<span className="movies-title-dot">.</span>
        </h1>
        <p>
          Find the smallest exact set of seat bundles for your watch party, so
          everyone gets a seat and none go to waste.
        </p>
      </header>

      <div className="booking-layout">
        <section
          className="booking-form-panel"
          aria-labelledby="booking-form-title"
        >
          <div className="booking-panel-heading">
            <span className="booking-panel-step">01</span>
            <div>
              <h2 id="booking-form-title">Plan your watch party</h2>
              <p>Choose a cinema and enter how many people are coming.</p>
            </div>
          </div>

          {isLoadingCinemas ? (
            <Loading message="Loading cinemas..." />
          ) : cinemas.length === 0 ? (
            <div className="booking-no-cinemas">
              <h3>No cinemas available yet</h3>
              <p>
                Add a cinema with its available seat bundles before requesting a
                quote.
              </p>
              <button
                type="button"
                className="movie-button movie-button-primary"
                onClick={() => onViewChange("createCinema")}
              >
                Add a cinema
              </button>
            </div>
          ) : (
            <form className="booking-form" onSubmit={handleSubmit} noValidate>
              <div className="movie-field">
                <label htmlFor="booking-cinema">Cinema</label>
                <select
                  id="booking-cinema"
                  className="movie-input"
                  value={cinemaId}
                  disabled={isLoadingQuote}
                  onChange={handleCinemaChange}
                  aria-invalid={Boolean(fieldErrors.cinemaId)}
                  aria-describedby={
                    fieldErrors.cinemaId ? "booking-cinema-error" : undefined
                  }
                >
                  <option value="">Choose a cinema</option>
                  {cinemas.map((cinema) => (
                    <option
                      key={String(cinema._id ?? cinema.id)}
                      value={String(cinema._id ?? cinema.id)}
                    >
                      {cinema.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.cinemaId && (
                  <p
                    className="movie-field-error"
                    id="booking-cinema-error"
                    role="alert"
                  >
                    {fieldErrors.cinemaId}
                  </p>
                )}
              </div>

              <div className="movie-field">
                <label htmlFor="booking-group-size">Group size</label>
                <input
                  id="booking-group-size"
                  className="movie-input"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="10000"
                  step="1"
                  value={groupSize}
                  disabled={isLoadingQuote}
                  onChange={handleGroupSizeChange}
                  placeholder="For example, 6"
                  aria-invalid={Boolean(fieldErrors.groupSize)}
                  aria-describedby={
                    fieldErrors.groupSize
                      ? "booking-group-size-error"
                      : "booking-group-size-hint"
                  }
                />
                {fieldErrors.groupSize ? (
                  <p
                    className="movie-field-error"
                    id="booking-group-size-error"
                    role="alert"
                  >
                    {fieldErrors.groupSize}
                  </p>
                ) : (
                  <p
                    className="booking-input-hint"
                    id="booking-group-size-hint"
                  >
                    Enter a whole number from 1 to 10,000.
                  </p>
                )}
              </div>

              {selectedCinema && (
                <div className="booking-bundle-options">
                  <span>Bundles this cinema sells</span>
                  <div className="booking-bundle-chips">
                    {availableBundleSizes.map((size) => (
                      <span className="booking-bundle-chip" key={size}>
                        {size} seats
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="movie-button movie-button-primary booking-submit"
                disabled={isLoadingQuote}
              >
                {isLoadingQuote
                  ? "Calculating quote..."
                  : "Find the best bundle mix"}
              </button>
            </form>
          )}
        </section>

        <section
          className={`booking-result-panel ${quote ? "booking-result-ready" : ""}`}
          aria-live="polite"
          aria-labelledby="booking-result-title"
        >
          {isLoadingQuote ? (
            <Loading message="Finding the fewest bundles..." />
          ) : !quote ? (
            <div className="booking-result-placeholder">
              <span className="booking-result-icon" aria-hidden="true">
                #
              </span>
              <h2 id="booking-result-title">Your quote will appear here</h2>
              <p>
                We will find the fewest bundles that seat your whole group
                exactly.
              </p>
            </div>
          ) : quote.possible ? (
            <div className="booking-quote-content">
              <div className="booking-result-heading">
                <div>
                  <span className="booking-result-kicker">
                    EXACT SEAT MATCH
                  </span>
                  <h2 id="booking-result-title">Your bundle quote</h2>
                  <p>
                    {quote.cinema?.name} · {quote.groupSize} people
                  </p>
                </div>
                <span className="booking-quote-status booking-quote-status-possible">
                  Exact fit
                </span>
              </div>

              <div className="booking-quote-stats">
                <QuoteStat label="Bundles to buy" value={quote.totalBundles} />
                <QuoteStat label="Seats included" value={totalSeats} />
              </div>

              <div className="booking-bundle-list-heading">
                <h3>Bundle breakdown</h3>
                <span>Buy these quantities</span>
              </div>
              <ul className="booking-bundle-list">
                {quote.bundles.map((bundle) => (
                  <li className="booking-bundle-row" key={bundle.size}>
                    <span className="booking-bundle-seat-count">
                      {bundle.size}
                      <small> seats</small>
                    </span>
                    <span
                      className="booking-bundle-multiplier"
                      aria-hidden="true"
                    >
                      ×
                    </span>
                    <span className="booking-bundle-quantity">
                      {bundle.quantity}
                    </span>
                    <span className="booking-bundle-label">
                      {bundle.quantity === 1 ? "bundle" : "bundles"}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="booking-exact-note">
                <span aria-hidden="true">✓</span>
                Exactly {quote.groupSize} seats, with no empty seats.
              </p>
            </div>
          ) : (
            <div className="booking-quote-content">
              <div className="booking-result-heading">
                <div>
                  <span className="booking-result-kicker">NO EXACT MATCH</span>
                  <h2 id="booking-result-title">These bundles do not add up</h2>
                  <p>
                    {quote.cinema?.name} · {quote.groupSize} people
                  </p>
                </div>
                <span className="booking-quote-status booking-quote-status-impossible">
                  Not possible
                </span>
              </div>

              <div className="booking-impossible-message">
                <p>
                  {quote.groupSize} seats cannot be matched exactly using this
                  cinema&apos;s bundle sizes ({availableBundleSizes.join(", ")}
                  ). Try a different group size or choose another cinema.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function QuoteStat({ label, value }) {
  return (
    <div className="booking-quote-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default BookingPage;
