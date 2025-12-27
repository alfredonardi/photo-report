import React from 'react';
import logo from '../assets/logo.jpg';

interface LoginProps {
  onLogin: () => void;
  onSignup: () => void;
}

/**
 * Componente de tela de login
 * Mostra logo e botões para login/cadastro usando Netlify Identity
 */
export const Login: React.FC<LoginProps> = ({ onLogin, onSignup }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Logo"
            className="w-24 h-24 mx-auto mb-4 rounded-full object-cover shadow-md"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Relatório Fotográfico
          </h1>
          <p className="text-gray-600 text-sm">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <button
            onClick={onLogin}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold
                     hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md
                     hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Entrar
          </button>

          <button
            onClick={onSignup}
            className="w-full bg-white text-blue-600 py-3 px-6 rounded-lg font-semibold
                     border-2 border-blue-600 hover:bg-blue-50 active:bg-blue-100
                     transition-all shadow-sm hover:shadow-md"
          >
            Criar Conta
          </button>
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            🔒 Acesso seguro via Netlify Identity
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            Entre em contato com o administrador para criar sua conta
          </p>
        </div>
      </div>
    </div>
  );
};
