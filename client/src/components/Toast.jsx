import { useEffect } from "react";
import ErrorMessage from "./ErrorMessage";

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast.duration) return undefined;

    const timeoutId = window.setTimeout(
      () => onDismiss(toast.id),
      toast.duration,
    );

    return () => window.clearTimeout(timeoutId);
  }, [onDismiss, toast.duration, toast.id]);

  if (toast.type === "error") {
    return (
      <div className="toast-item toast-item-error">
        <ErrorMessage
          title={toast.title}
          message={toast.message}
          onRetry={
            toast.onRetry
              ? () => {
                  toast.onRetry();
                  onDismiss(toast.id);
                }
              : undefined
          }
          onDismiss={() => onDismiss(toast.id)}
        />
      </div>
    );
  }

  return (
    <div className="toast-item toast-success" role="status" aria-live="polite">
      <span className="toast-success-icon" aria-hidden="true">
        ✓
      </span>
      <div className="toast-success-content">
        {toast.title && <p className="toast-success-title">{toast.title}</p>}
        <p>{toast.message}</p>
      </div>
      <button
        type="button"
        className="toast-success-dismiss"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
