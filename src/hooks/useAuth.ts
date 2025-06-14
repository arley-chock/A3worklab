import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        setAuthState({ user: null, loading: false, error: null });
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha na autenticação');
      }

      const user = await response.json();
      setAuthState({ user, loading: false, error: null });
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: 'Erro ao verificar autenticação',
      });
      Cookies.remove('token');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthState({ ...authState, loading: true, error: null });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha no login');
      }

      const { token, user } = await response.json();
      Cookies.set('token', token, { expires: 1 }); // Expira em 1 dia
      setAuthState({ user, loading: false, error: null });
      router.push('/');
    } catch (error) {
      setAuthState({
        ...authState,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro no login',
      });
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    department?: string;
    phone?: string;
  }) => {
    try {
      setAuthState({ ...authState, loading: true, error: null });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha no registro');
      }

      const { token, user } = await response.json();
      Cookies.set('token', token, { expires: 1 });
      setAuthState({ user, loading: false, error: null });
      router.push('/');
    } catch (error) {
      setAuthState({
        ...authState,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro no registro',
      });
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setAuthState({ user: null, loading: false, error: null });
    router.push('/auth/login');
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    logout,
  };
} 