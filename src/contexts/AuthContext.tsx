'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    department?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
  }
  return context;
} 