import React, { useState } from 'react';
import { showToast } from '../utils/toast';
import { AuthError } from '../types';
import logo from '../assets/logo.jpg';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

/**
 * Componente de tela de login com Supabase Auth
 * Sistema restrito - apenas usuários convidados podem acessar
 */
export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast.warning('Por favor, preencha email e senha');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(email, password);
      showToast.success('Login realizado com sucesso!');
    } catch (error) {
      console.error('Login error:', error);

      const authError = error as AuthError;

      // Mensagens de erro amigáveis
      if (authError.message?.includes('Invalid login credentials')) {
        showToast.error('Email ou senha incorretos');
      } else if (authError.message?.includes('Email not confirmed')) {
        showToast.error('Email não confirmado. Verifique sua caixa de entrada.');
      } else {
        showToast.error('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Logo"
            className="w-32 h-32 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Relatório Fotográfico
          </h1>
          <p className="text-gray-600 text-sm">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Formulário de login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold
                     hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md
                     hover:shadow-lg transform hover:-translate-y-0.5
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Informações adicionais */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">
            🔒 Acesso restrito - Apenas usuários autorizados
          </p>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-800 text-center font-medium">
              Não tem acesso?
            </p>
            <p className="text-xs text-blue-600 text-center mt-1">
              Entre em contato com o administrador para solicitar convite
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
