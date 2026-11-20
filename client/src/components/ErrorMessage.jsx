function ErrorMessage({
  message = "Something went wrong. Please try again.",
  title = "Unable to complete request",
  onRetry,
  onDismiss,
}) {
  return (
    <div className="error-message" role="alert">
      <span className="error-icon" aria-hidden="true">
        !
      </span>

      <div className="error-content">
        <p className="error-title">{title}</p>
        <p className="error-description">{message}</p>

        {onRetry && (
          <div className="error-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onRetry}
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          className="error-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
