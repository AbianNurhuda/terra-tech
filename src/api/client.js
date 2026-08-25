const BASE_URL = import.meta.env.VITE_API_URL || "";

class ApiClient {
  async request(endpoint, options = {}) {
    const url = BASE_URL
      ? `${BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`
      : endpoint;

    // Get token from localStorage
    const token = localStorage.getItem("api_token");

    // Setup headers
    const headers = {
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Determine if body is FormData
    const isFormData = options.body instanceof FormData;

    if (!isFormData) {
      headers["Accept"] = "application/json";
      headers["Content-Type"] = "application/json";
    }

    const config = {
      ...options,
      headers,
    };

    if (options.body && !isFormData && typeof options.body === "object") {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      // Handle global authentication failures (401)
      if (response.status === 401) {
        this.clearSessionAndRedirect();
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          status: 401,
          message:
            errorData.message ||
            "Sesi Anda telah berakhir. Silakan login kembali.",
          errors: {},
        };
      }

      // Read response content type
      const contentType = response.headers.get("content-type");
      let data = null;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Return structured error
        return {
          success: false,
          status: response.status,
          message:
            data?.message ||
            `Permintaan gagal dengan status ${response.status}`,
          errors: data?.data?.errors || data?.errors || {},
        };
      }

      return {
        success: true,
        status: response.status,
        message: data?.message || "Sukses",
        data: data?.data ?? data,
      };
    } catch (error) {
      console.error("API Request Error:", error);
      return {
        success: false,
        status: 503,
        message:
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
        errors: {},
      };
    }
  }

  clearSessionAndRedirect() {
    localStorage.removeItem("api_token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");

    // Redirect only if not already on the login page to prevent looping
    if (window.location.pathname !== "/login") {
      window.location.href = "/login?expired=true";
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

export const client = new ApiClient();
export default client;
