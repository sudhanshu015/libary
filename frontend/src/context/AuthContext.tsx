import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "librarian";
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

interface AuthResponse {
  success?: boolean;
  message?: string;
  data?: AuthUser | { token: string; user: AuthUser };
}

async function readAuthResponse(res: Response): Promise<AuthResponse> {
  try {
    const body: unknown = await res.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new TypeError("Invalid API response");
    }
    return body as AuthResponse;
  } catch {
    throw new Error(`API returned an invalid response (HTTP ${res.status}). Check the backend deployment.`);
  }
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAdmin: false,
});

const TOKEN_KEY = "libraryos_token";

// ─── API Base URL ─────────────────────────────────────────────────────────────
// In production (Vercel), VITE_API_URL = https://your-backend.onrender.com
// In development, falls back to empty string so relative /api/* paths work via vite proxy
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (jwt: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const json = await readAuthResponse(res);
      if (res.ok && json.success && json.data && "role" in json.data) {
        setUser(json.data);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchMe]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await readAuthResponse(res);
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Login failed");
    }
    const data = json.data;
    if (!data || !("token" in data) || !data.token || !data.user) {
      throw new Error("Login response is missing the token or user.");
    }
    const { token: jwt, user: userData } = data;
    localStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
