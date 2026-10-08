import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";
const api = axios.create({ baseURL });
let refreshRequest;

function readStoredToken(key) {
  return typeof window === "undefined" ? null : window.localStorage.getItem(key);
}

function isAuthEndpoint(url = "") {
  return ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].some((path) =>
    url.endsWith(path)
  );
}

function clearStoredAuth() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem("user");
  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("refreshToken");
  window.dispatchEvent(new Event("mosaic:auth-cleared"));
}

async function refreshAccessToken() {
  if (!refreshRequest) {
    const refreshToken = readStoredToken("refreshToken");
    if (!refreshToken) throw new Error("No refresh token available");

    refreshRequest = axios
      .post(`${baseURL}/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        window.localStorage.setItem("accessToken", data.accessToken);
        window.localStorage.setItem("refreshToken", data.refreshToken);
        window.dispatchEvent(new Event("mosaic:auth-updated"));
        return data.accessToken;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

api.interceptors.request.use((config) => {
  const accessToken = readStoredToken("accessToken");
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      isAuthEndpoint(request.url)
    ) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      const accessToken = await refreshAccessToken();
      request.headers.Authorization = `Bearer ${accessToken}`;
      return api(request);
    } catch (refreshError) {
      clearStoredAuth();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
