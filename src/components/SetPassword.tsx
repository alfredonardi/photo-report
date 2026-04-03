import React, { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { supabase } from '../services/supabase/config';
import { showToast } from '../utils/toast';
import { AuthError } from '../types';
import logo from '../assets/logo.jpg';

interface SetPasswordProps {
  onPasswordSet: () => void;
}

export const SetPassword: React.FC<SetPasswordProps> = ({ onPasswordSet }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const getPasswordStrength = (pwd: string): number => {
    let strength = 0;

    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 15;
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 15;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15;

    return strength;
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 40) return 'bg-rose-500';
    if (strength < 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = (strength: number): string => {
    if (strength < 40) return 'Fraca';
    if (strength < 70) return 'Média';
    return 'Forte';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      showToast.error('As senhas não coincidem');
      return;
    }

    const validation = validatePassword(password);
    if (!validation.valid) {
      showToast.error(validation.message);
      return;
    }

    setIsLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase não configurado.');
      }

      const { error } = await supabase.auth.updateUser({
        password,
        data: {
          password_set: true,
        },
      });

      if (error) throw error;

      showToast.success('Senha definida com sucesso!');

      setTimeout(() => {
        onPasswordSet();
      }, 1000);
    } catch (error) {
      console.error('Error setting password:', error);
      const authError = error as AuthError;
      showToast.error(`Erro ao definir senha: ${authError.message || 'Tente novamente'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="auth-shell px-4">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="auth-shell__panel">
          <img src={logo} alt="Logo" className="h-24 w-24 object-contain" />
          <p className="auth-shell__eyebrow mt-6">Primeiro acesso</p>
          <h1 className="auth-shell__title mt-3">Defina sua senha e entre no ambiente de trabalho</h1>
          <p className="auth-shell__description">
            Esse passo conclui o convite e mantém a área de relatórios protegida, sem alterar o
            formato do PDF que já está em produção.
          </p>

          <div className="mt-8 rounded-[24px] border border-slate-200/80 bg-white/80 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="mt-1 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Acesso seguro e rastreável</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Sua senha protege o acesso à área de preparação do relatório e reforça a autoria do documento.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-shell__panel">
          <div className="mb-8">
            <p className="auth-shell__eyebrow">Definição de senha</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Escolha uma senha forte</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Depois disso, o acesso ao sistema segue normalmente com email e senha.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Nova senha</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="auth-input pr-14"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <KeyRound size={16} />
                </button>
              </div>

              {password && (
                <div className="mt-3">
                  <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600">
                    <span>Força da senha</span>
                    <span>{getStrengthText(passwordStrength)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className={`h-2 rounded-full transition-all ${getStrengthColor(passwordStrength)}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Confirmar senha</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Digite a senha novamente"
                className="auth-input"
                required
                disabled={isLoading}
              />
              {confirmPassword && (
                <p className={`mt-2 text-xs font-medium ${password === confirmPassword ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {password === confirmPassword ? 'As senhas coincidem.' : 'As senhas não coincidem.'}
                </p>
              )}
            </label>

            <div className="rounded-[24px] border border-blue-200 bg-blue-50/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Requisitos</p>
              <ul className="mt-3 space-y-2 text-sm text-blue-900">
                <li>{password.length >= 8 ? '✓' : '○'} Mínimo de 8 caracteres</li>
                <li>{/[A-Z]/.test(password) ? '✓' : '○'} Uma letra maiúscula</li>
                <li>{/[a-z]/.test(password) ? '✓' : '○'} Uma letra minúscula</li>
                <li>{/[0-9]/.test(password) ? '✓' : '○'} Um número</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
              className="auth-primary-button"
            >
              {isLoading ? 'Definindo senha...' : 'Definir senha e continuar'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
