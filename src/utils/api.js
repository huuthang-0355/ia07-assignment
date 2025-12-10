import axios from "axios";
import { mockApi } from "../services/mockApi";

// Access token lưu trong memory (biến) - Requirement: Access token in memory
let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

// Check if we're using mock API (for development)
const USE_MOCK_API = !import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: USE_MOCK_API ? "/api" : import.meta.env.VITE_API_BASE_URL || "https://your-api-url.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Attach access token to all requests
api.interceptors.request.use(
  async (config) => {
    // Use mock API for development if no real API URL is set
    if (USE_MOCK_API) {
      const url = config.url;
      
      // Handle mock API calls directly in request interceptor
      if (url === "/login" && config.method === "post") {
        try {
          const { email, password } = config.data;
          const data = await mockApi.login(email, password);
          // Return a mock response by throwing a special error that response interceptor will catch
          const mockResponse = {
            data,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          };
          // Use adapter to return mock response
          config.adapter = () => Promise.resolve(mockResponse);
        } catch (mockError) {
          // Format error to match axios error structure
          const axiosError = {
            ...mockError,
            response: mockError.response || {
              status: 401,
              data: { message: mockError.message || "Authentication failed" }
            },
            config
          };
          config.adapter = () => Promise.reject(axiosError);
        }
      } else if (url === "/refresh" && config.method === "post") {
        try {
          const refreshToken = config.data?.token || localStorage.getItem("refreshToken");
          const data = await mockApi.refreshToken(refreshToken);
          const mockResponse = {
            data,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          };
          config.adapter = () => Promise.resolve(mockResponse);
        } catch (mockError) {
          // Format error to match axios error structure
          const axiosError = {
            ...mockError,
            response: mockError.response || {
              status: 401,
              data: { message: mockError.message || "Authentication failed" }
            },
            config
          };
          config.adapter = () => Promise.reject(axiosError);
        }
      } else if (url === "/me" && config.method === "get") {
        try {
          const token = config.headers.Authorization?.replace("Bearer ", "") || accessToken;
          const data = await mockApi.getCurrentUser(token);
          const mockResponse = {
            data,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          };
          config.adapter = () => Promise.resolve(mockResponse);
        } catch (mockError) {
          // Format error to match axios error structure
          const axiosError = {
            ...mockError,
            response: mockError.response || {
              status: 401,
              data: { message: mockError.message || "Authentication failed" }
            },
            config
          };
          config.adapter = () => Promise.reject(axiosError);
        }
      }
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized with automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        let response;
        if (USE_MOCK_API) {
          // Use mock API
          const data = await mockApi.refreshToken(refreshToken);
          response = { data };
        } else {
          // Use real API
          response = await axios.post(
            `${api.defaults.baseURL}/refresh`,
            { token: refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );
        }

        const newAccessToken = response.data.accessToken;
        setAccessToken(newAccessToken);

        // Update headers and retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        processQueue(null, newAccessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        processQueue(refreshError, null);
        isRefreshing = false;

        clearAccessToken();
        localStorage.removeItem("refreshToken");
        
        // Redirect to login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
