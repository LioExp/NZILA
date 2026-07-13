import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

interface LocalUser {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  profileImageUrl: string | null;
}

interface AuthContextValue {
  user: LocalUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (firstName: string, email: string) => void;
  logout: () => void;
}

const AUTH_KEY = "nzila_auth_user";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setIsLoading(false);
  }, []);

  const login = (firstName: string, email: string) => {
    const existing = localStorage.getItem(AUTH_KEY);
    let id = uuidv4();
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (parsed.email === email) id = parsed.id;
      } catch {}
    }
    const newUser: LocalUser = {
      id,
      firstName: firstName.trim(),
      lastName: null,
      email: email.trim().toLowerCase(),
      profileImageUrl: null,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("nzila_profile");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
