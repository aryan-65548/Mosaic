import { create } from "zustand";
import { logoutUser } from "../services/auth.api.js";

function readUser() {
  try {
    return JSON.parse(window.localStorage.getItem("user")) || null;
  } catch {
    window.localStorage.removeItem("user");
    return null;
  }
}

function clearStoredAuth() {
  window.localStorage.removeItem("user");
  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("refreshToken");
}

const useAuthStore = create((set, get) => ({
  user: readUser(),
  accessToken: window.localStorage.getItem("accessToken") || null,
  refreshToken: window.localStorage.getItem("refreshToken") || null,

  login: (user, accessToken, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({ user, accessToken, refreshToken });
  },

  updateUser: (user) => {
    window.localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  logout: async () => {
    const refreshToken = get().refreshToken;
    clearStoredAuth();
    set({ user: null, accessToken: null, refreshToken: null });

    try {
      if (refreshToken) await logoutUser(refreshToken);
    } catch {
      // The local session is already cleared if the API is unavailable or the token expired.
    }
  },
}));

window.addEventListener("mosaic:auth-updated", () => {
  setAuthFromStorage();
});

window.addEventListener("mosaic:auth-cleared", () => {
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
});

window.addEventListener("storage", (event) => {
  if (["user", "accessToken", "refreshToken"].includes(event.key) || event.key === null) {
    setAuthFromStorage();
  }
});

function setAuthFromStorage() {
  useAuthStore.setState({
    user: readUser(),
    accessToken: window.localStorage.getItem("accessToken") || null,
    refreshToken: window.localStorage.getItem("refreshToken") || null,
  });
}

export default useAuthStore;
