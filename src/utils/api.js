const API_BASE_URL =
  process.env.NEXT_PUBLIC_NODE_API_BASE_URL || "http://localhost:5000";

const FALLBACK_ERROR_MESSAGE = "Something went wrong. Please try again.";

function toUserFriendlyMessage(errorOrMessage, status) {
  const message =
    typeof errorOrMessage === "string"
      ? errorOrMessage
      : errorOrMessage?.message;
  const statusCode =
    typeof status === "number" ? status : errorOrMessage?.status;

  if (message?.toLowerCase().includes("timeout") || errorOrMessage?.aborted) {
    return "Request timed out. Please check your connection and try again.";
  }

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You appear to be offline. Please reconnect and try again.";
  }

  if (message?.toLowerCase().includes("failed to fetch")) {
    return "We couldn't reach the server. Please check your connection.";
  }

  if (statusCode === 401) {
    return "Your session expired. Please sign in again.";
  }

  if (statusCode === 403) {
    return "You don't have permission to perform this action.";
  }

  if (statusCode && statusCode >= 500) {
    return "We're having trouble on our end. Please try again shortly.";
  }

  return message || FALLBACK_ERROR_MESSAGE;
}

function buildApiError(message, status = 0, data = {}) {
  const error = new Error(message || FALLBACK_ERROR_MESSAGE);
  error.status = status;
  error.data = data || {};
  error.userMessage = toUserFriendlyMessage(error, status);
  return error;
}

export function getApiErrorMessage(error) {
  if (!error) return FALLBACK_ERROR_MESSAGE;
  return error.userMessage || toUserFriendlyMessage(error, error?.status);
}

// Timeout Fetch with Retry (handles network errors + 429 rate-limit backoff)
export async function fetchWithTimeout(
  resource,
  options = {},
  timeout = 10000,
  retries = 3,
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();

    if (options.signal) {
      options.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(resource, {
        ...options,
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(id);

      if (res.status === 429 && attempt < retries) {
        const retryAfter = res.headers.get("Retry-After");
        const delay = retryAfter ? Number(retryAfter) * 1000 : 2000 * attempt;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      return res;
    } catch (err) {
      clearTimeout(id);

      if (err.name === "AbortError" && options.signal?.aborted) {
        throw err;
      }

      if (attempt === retries) {
        if (err.name === "AbortError") {
          return { aborted: true };
        }
        err.userMessage = getApiErrorMessage(err);
        throw err;
      }

      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

// Unified error handler
async function handleResponse(res) {
  if (res?.aborted) {
    throw buildApiError("Request timeout - please try again", 0, {
      message: "Request timeout",
    });
  }

  // Ensure we have a fetch Response object
  if (!res || typeof res.text !== "function") {
    throw buildApiError("Invalid response from server", 0, {
      message: "Invalid response from server",
    });
  }

  // Read body once as text to allow manual JSON parsing
  let text = "";
  try {
    text = await res.text();
  } catch (readError) {
    throw buildApiError("Unable to read server response", res.status || 0, {
      message: readError?.message || "Unable to read server response",
    });
  }

  let data;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  } else {
    data = {};
  }

  if (!res.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || `Error: ${res.statusText || "Unknown error"}`;

    const normalizedData = typeof data === "string" ? { message: data } : data;
    const error = buildApiError(message, res.status, normalizedData);

    if (res.status === 401 && typeof window !== "undefined") {
      // Clear any cached auth state and force re-auth
      localStorage.removeItem("activeVideoSession");
      localStorage.removeItem("sessionStartTime");
      // Use a small timeout to let toasts render before redirect
      setTimeout(() => {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }, 300);
    }

    throw error;
  }

  if (typeof data === "string") {
    return { message: data };
  }

  return data;
}

// GET
export async function fetchData(endpoint, token = null, extraOptions = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetchWithTimeout(`${API_BASE_URL}/${endpoint}`, {
    headers,
    ...extraOptions,
  });
  return handleResponse(res);
}

// POST
export async function postData(
  endpoint,
  data,
  token = null,
  isFormData = false,
) {
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      }
    : { "Content-Type": "application/json" };

  const res = await fetchWithTimeout(`${API_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });

  return handleResponse(res);
}

export async function rescheduleAppointment(id, payload = {}, token = null) {
  // Reuse the existing update endpoint for consultation appointments
  return await updateData(
    `consultation-appointments/update/custom/${id}`,
    payload,
    token,
  );
}

// PUT
export async function updateData(
  endpoint,
  data,
  token = null,
  isFormData = false,
) {
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      }
    : { "Content-Type": "application/json" };

  const res = await fetchWithTimeout(`${API_BASE_URL}/${endpoint}`, {
    method: "PUT",
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });

  return handleResponse(res);
}

// DELETE
export async function deleteData(endpoint, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetchWithTimeout(`${API_BASE_URL}/${endpoint}`, {
    method: "DELETE",
    headers,
  });

  return handleResponse(res);
}
