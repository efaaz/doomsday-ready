const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.message || data?.error || "Something went wrong",
    );
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }

  return data;
}
