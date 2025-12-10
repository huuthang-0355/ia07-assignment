// Mock API Service for Development and Testing
// In production, replace this with real API endpoints

const MOCK_USERS = [
  {
    id: 1,
    email: "user@example.com",
    password: "password123",
    name: "John Doe",
    role: "user",
  },
  {
    id: 2,
    email: "admin@example.com",
    password: "admin123",
    name: "Jane Smith",
    role: "admin",
  },
];

// Simulate network delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Simple JWT token generator (mock)
const generateToken = (payload, expiresIn = "15m") => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const exp = Date.now() + (expiresIn === "15m" ? 15 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000);
  const tokenPayload = { ...payload, exp };
  const body = btoa(JSON.stringify(tokenPayload));
  return `${header}.${body}.mock-signature`;
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp < Date.now();
  } catch {
    return true;
  }
};

// Mock API endpoints
export const mockApi = {
  async login(email, password) {
    await delay(800);

    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      const error = new Error("Invalid email or password");
      error.response = { status: 401, data: { message: "Invalid credentials" } };
      throw error;
    }

    const accessToken = generateToken(
      { userId: user.id, email: user.email, role: user.role },
      "15m"
    );
    const refreshToken = generateToken(
      { userId: user.id, type: "refresh" },
      "7d"
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },

  async refreshToken(refreshToken) {
    await delay(500);

    if (!refreshToken || isTokenExpired(refreshToken)) {
      const error = new Error("Refresh token expired or invalid");
      error.response = { status: 401, data: { message: "Token expired" } };
      throw error;
    }

    try {
      const parts = refreshToken.split(".");
      const payload = JSON.parse(atob(parts[1]));
      const user = MOCK_USERS.find((u) => u.id === payload.userId);

      if (!user) {
        throw new Error("User not found");
      }

      const newAccessToken = generateToken(
        { userId: user.id, email: user.email, role: user.role },
        "15m"
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      const err = new Error("Invalid refresh token");
      err.response = { status: 401, data: { message: "Invalid token" } };
      throw err;
    }
  },

  async getCurrentUser(accessToken) {
    await delay(400);

    if (!accessToken || isTokenExpired(accessToken)) {
      const error = new Error("Access token expired or invalid");
      error.response = { status: 401, data: { message: "Token expired" } };
      throw error;
    }

    try {
      const parts = accessToken.split(".");
      const payload = JSON.parse(atob(parts[1]));
      const user = MOCK_USERS.find((u) => u.id === payload.userId);

      if (!user) {
        throw new Error("User not found");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      const err = new Error("Invalid access token");
      err.response = { status: 401, data: { message: "Invalid token" } };
      throw err;
    }
  },
};

