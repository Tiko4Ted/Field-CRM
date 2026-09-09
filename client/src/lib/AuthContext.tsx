import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from './api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    const restoreSession = async () => {
      if (!storedToken || !storedUser) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<User>('/auth/me');
        if (!isMounted) return;

        localStorage.setItem('user', JSON.stringify(response.data));
        setToken(storedToken);
        setUser(response.data);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!isMounted) return;

        setToken(null);
        setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
