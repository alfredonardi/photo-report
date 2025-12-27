import React from 'react';
import logo from '../assets/logo.jpg';

interface LoginProps {
  onLogin: () => void;
}

/**
 * Componente de tela de login
 * Sistema restrito - apenas usuários convidados podem acessar
 */
export const Login: React.FC<LoginProps> = ({ onLogin }) => {
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

        {/* Botão de login */}
        <div className="space-y-3">
          <button
            onClick={onLogin}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold
                     hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md
                     hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Entrar
          </button>
        </div>

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
