import { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../services/supabase/config';
import type { User as SupabaseUser, AuthResponse } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

/**
 * Hook de autenticação com Supabase Auth
 * Gerencia login, logout e estado do usuário
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  /**
   * Mapeia usuário do Supabase para nosso formato
   */
  const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      user_metadata: supabaseUser.user_metadata,
    };
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Verifica sessão atual
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        setUser(session?.user ? mapSupabaseUser(session.user) : null);
      })
      .catch((error) => {
        console.error('Error getting auth session:', error);
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    // Escuta mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ? mapSupabaseUser(session.user) : null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  /**
   * Login com email e senha
   */
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    if (!supabase) {
      throw new Error('Supabase não configurado.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  /**
   * Signup (não será usado - sistema invite-only)
   * Mantido apenas para compatibilidade
   */
  const signup = async (email: string, password: string): Promise<AuthResponse> => {
    if (!supabase) {
      throw new Error('Supabase não configurado.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  /**
   * Logout
   */
  const logout = async (): Promise<void> => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isConfigured,
  };
};
