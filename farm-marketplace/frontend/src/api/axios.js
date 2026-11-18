import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // sends the refresh cookie
});

let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};

// Attach the token to every request
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// If the token expired, refresh once and retry the request
let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.startsWith("/auth/");

    if (error.response?.status === 401 && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshing = refreshing || api.post("/auth/refresh").finally(() => (refreshing = null));
        const { data } = await refreshing;
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        setAccessToken(null);
      }
    }
    return Promise.reject(error);
  }
);

// Turns any API error into a readable message
export const errorMessage = (err) => {
  const data = err.response?.data;
  if (data?.errors?.length) return data.errors.map((e) => `${e.field}: ${e.message}`).join(", ");
  return data?.message || "Something went wrong. Please try again.";
};

export default api;