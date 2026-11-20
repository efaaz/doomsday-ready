import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { ToastContext } from "../hooks/useToast";
import Toast from "./Toast";

function getErrorDetails(error, fallback = {}) {
  if (
    error?.code === "CIRCULAR_DEPENDENCY" ||
    /circular dependency/i.test(error?.message ?? "")
  ) {
    return {
      title: "Circular prerequisite detected",
      message:
        "These prerequisites would create a loop in the watch order. Remove one or more selected prerequisites and try again.",
    };
  }

  if (
    error?.code === "DUPLICATE_MOVIE_TITLE" ||
    error?.code === "DUPLICATE_VALUE"
  ) {
    return {
      title: "Movie already exists",
      message:
        error.message ||
        "A movie with this title already exists. Choose a different title.",
    };
  }

  return {
    title: error?.status === 409 ? "Update conflict" : fallback.title,
    message: error?.message || fallback.message || "Please try again.",
  };
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  const pushToast = useCallback((toast) => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { ...toast, id }].slice(-4));
    return id;
  }, []);

  const success = useCallback(
    (message, options = {}) =>
      pushToast({
        type: "success",
        title: options.title ?? "",
        message,
        duration: options.duration ?? 5000,
      }),
    [pushToast],
  );

  const error = useCallback(
    (cause, options = {}) => {
      const details = getErrorDetails(cause, options);
      return pushToast({
        type: "error",
        ...details,
        onRetry: options.onRetry,
        duration: options.duration ?? 0,
      });
    },
    [pushToast],
  );

  const value = useMemo(
    () => ({ success, error, clear }),
    [clear, error, success],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-label="Notifications">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
