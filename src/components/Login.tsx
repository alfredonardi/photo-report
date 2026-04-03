import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { showToast } from '../utils/toast';
import { AuthError } from '../types';
import logo from '../assets/logo.jpg';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

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
    <div className="auth-shell px-4">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="auth-shell__panel">
          <img src={logo} alt="Logo" className="mt-6 h-24 w-24 object-contain" />
          <h1 className="auth-shell__title mt-6">Gerador de Relatório Fotográfico</h1>
          <div className="mt-8 flex items-center gap-3 rounded-[24px] border border-slate-200/80 bg-white/80 px-4 py-4 text-sm text-slate-600">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span>Acesso restrito a usuários autorizados.</span>
          </div>
        </section>

        <section className="auth-shell__panel">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Entrar</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu.email@exemplo.com"
                className="auth-input"
                disabled={isLoading}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="auth-input"
                disabled={isLoading}
                required
              />
            </label>

            <button type="submit" disabled={isLoading} className="auth-primary-button">
              {isLoading ? 'Entrando...' : 'Entrar no sistema'}
            </button>
          </form>

          <div className="mt-8 rounded-[24px] border border-slate-200/80 bg-slate-50/90 p-4 text-sm leading-6 text-slate-600">
            Solicite um convite ao administrador se precisar de acesso.
          </div>
        </section>
      </div>
    </div>
  );
};
