import React, { useState } from 'react';
import { supabase } from '../services/supabase/config';
import { showToast } from '../utils/toast';
import logo from '../assets/logo.jpg';

interface SetPasswordProps {
  onPasswordSet: () => void;
}

/**
 * Componente para usuário definir senha após aceitar convite
 * Aparece no primeiro acesso quando usuário vem de um convite
 */
export const SetPassword: React.FC<SetPasswordProps> = ({ onPasswordSet }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Valida força da senha
   */
  const validatePassword = (pwd: string): { valid: boolean; message: string } => {
    if (pwd.length < 8) {
      return { valid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
    }

    if (!/[A-Z]/.test(pwd)) {
      return { valid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' };
    }

    if (!/[a-z]/.test(pwd)) {
      return { valid: false, message: 'A senha deve conter pelo menos uma letra minúscula' };
    }

    if (!/[0-9]/.test(pwd)) {
      return { valid: false, message: 'A senha deve conter pelo menos um número' };
    }

    return { valid: true, message: 'Senha válida' };
  };

  /**
   * Retorna a força da senha em %
   */
  const getPasswordStrength = (pwd: string): number => {
    let strength = 0;

    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 15;
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 15;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15; // Caracteres especiais

    return strength;
  };

  /**
   * Retorna cor baseada na força da senha
   */
  const getStrengthColor = (strength: number): string => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  /**
   * Retorna texto baseado na força da senha
   */
  const getStrengthText = (strength: number): string => {
    if (strength < 40) return 'Fraca';
    if (strength < 70) return 'Média';
    return 'Forte';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valida se as senhas coincidem
    if (password !== confirmPassword) {
      showToast.error('As senhas não coincidem');
      return;
    }

    // Valida força da senha
    const validation = validatePassword(password);
    if (!validation.valid) {
      showToast.error(validation.message);
      return;
    }

    setIsLoading(true);

    try {
      // Atualiza a senha do usuário atual
      const { error } = await supabase.auth.updateUser({
        password: password,
        data: {
          password_set: true, // Marca que a senha foi definida
        },
      });

      if (error) throw error;

      showToast.success('Senha definida com sucesso!');

      // Aguarda um pouco para o usuário ver a mensagem
      setTimeout(() => {
        onPasswordSet();
      }, 1000);

    } catch (error: any) {
      console.error('Error setting password:', error);
      showToast.error('Erro ao definir senha: ' + (error.message || 'Tente novamente'));
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

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
            Defina sua Senha
          </h1>
          <p className="text-gray-600 text-sm">
            Escolha uma senha forte para proteger sua conta
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nova Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Indicador de força da senha */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Força da senha:</span>
                  <span className="text-xs font-medium text-gray-700">
                    {getStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getStrengthColor(passwordStrength)}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirme a Senha
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
              disabled={isLoading}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                As senhas não coincidem
              </p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="text-xs text-green-500 mt-1">
                ✓ Senhas coincidem
              </p>
            )}
          </div>

          {/* Requisitos da senha */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs font-medium text-blue-800 mb-2">
              Requisitos da senha:
            </p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li className={password.length >= 8 ? 'text-green-600' : ''}>
                {password.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
              </li>
              <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                {/[A-Z]/.test(password) ? '✓' : '○'} Uma letra maiúscula
              </li>
              <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                {/[a-z]/.test(password) ? '✓' : '○'} Uma letra minúscula
              </li>
              <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                {/[0-9]/.test(password) ? '✓' : '○'} Um número
              </li>
            </ul>
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold
                     hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md
                     hover:shadow-lg transform hover:-translate-y-0.5
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Definindo senha...
              </span>
            ) : (
              'Definir Senha e Continuar'
            )}
          </button>
        </form>

        {/* Informações adicionais */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            🔒 Sua senha será criptografada e armazenada com segurança
          </p>
        </div>
      </div>
    </div>
  );
};
