import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

interface LocalUser {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  profileImageUrl: string | null;
}

interface StoredAccount {
  id: string;
  firstName: string;
  password: string;
}

interface AuthContextValue {
  user: LocalUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (firstName: string, email: string, password: string) => string | null;
  logout: () => void;
}

const SESSION_KEY = "nzila_session";
const ACCOUNTS_KEY = "nzila_accounts";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => null,
  logout: () => {},
});

function getAccounts(): Record<string, StoredAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAccounts(accounts: Record<string, StoredAccount>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setIsLoading(false);
  }, []);

  const login = (firstName: string, email: string, password: string): string | null => {
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = getAccounts();
    const existing = accounts[normalizedEmail];

    if (existing) {
      if (existing.password !== password) {
        return "Senha incorrecta.";
      }
      const sessionUser: LocalUser = {
        id: existing.id,
        firstName: existing.firstName,
        lastName: null,
        email: normalizedEmail,
        profileImageUrl: null,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);
      return null;
    }

    const newId = uuidv4();
    accounts[normalizedEmail] = {
      id: newId,
      firstName: firstName.trim(),
      password,
    };
    saveAccounts(accounts);

    const sessionUser: LocalUser = {
      id: newId,
      firstName: firstName.trim(),
      lastName: null,
      email: normalizedEmail,
      profileImageUrl: null,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return null;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
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
