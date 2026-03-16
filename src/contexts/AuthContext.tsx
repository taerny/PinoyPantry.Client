import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

interface User {
  email: string;
  fullName: string;
  role: string;
  token: string;
  expiration: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('pp_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User;
        if (new Date(parsed.expiration) > new Date()) {
          setUser(parsed);
        } else {
          localStorage.removeItem('pp_user');
        }
      } catch {
        localStorage.removeItem('pp_user');
      }
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }

    const data = await res.json();
    const userData: User = {
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      token: data.token,
      expiration: data.expiration,
    };
    setUser(userData);
    localStorage.setItem('pp_user', JSON.stringify(userData));
  }

  async function register(regData: RegisterData) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }

    const data = await res.json();
    const userData: User = {
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      token: data.token,
      expiration: data.expiration,
    };
    setUser(userData);
    localStorage.setItem('pp_user', JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('pp_user');
  }

  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
