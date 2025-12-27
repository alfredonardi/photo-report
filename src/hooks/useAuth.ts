import { useState, useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

/**
 * Hook de autenticação com Netlify Identity
 * Gerencia login, logout e estado do usuário
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicializa o Netlify Identity
    netlifyIdentity.init();

    // Verifica se já existe um usuário logado
    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) {
      setUser(currentUser as User);
    }
    setLoading(false);

    // Event listeners para mudanças de autenticação
    const handleLogin = (user: any) => {
      setUser(user as User);
      netlifyIdentity.close();
    };

    const handleLogout = () => {
      setUser(null);
    };

    netlifyIdentity.on('login', handleLogin);
    netlifyIdentity.on('logout', handleLogout);

    // Cleanup
    return () => {
      netlifyIdentity.off('login', handleLogin);
      netlifyIdentity.off('logout', handleLogout);
    };
  }, []);

  const login = () => {
    netlifyIdentity.open('login');
  };

  const signup = () => {
    netlifyIdentity.open('signup');
  };

  const logout = () => {
    netlifyIdentity.logout();
  };

  return {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };
};
