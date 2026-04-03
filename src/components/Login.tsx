import React, { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
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
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="auth-shell__panel">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
            Acesso restrito
          </div>
          <img src={logo} alt="Logo" className="mt-6 h-24 w-24 object-contain" />
          <h1 className="auth-shell__title mt-6">Gerador de Relatório Fotográfico</h1>
          <p className="auth-shell__description">
            Entre para preencher os dados do relatório, importar as fotos e gerar o PDF.
          </p>

          <div className="mt-8 grid gap-3">
            <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="mt-1 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Autenticação obrigatória</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    O acesso é vinculado ao usuário autenticado.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-4">
              <div className="flex items-start gap-3">
                <LockKeyhole size={20} className="mt-1 text-blue-700" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Convite controlado</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Apenas usuários autorizados pelo administrador podem entrar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-shell__panel">
          <div className="mb-8">
            <p className="auth-shell__eyebrow">Entrar no sistema</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Acesse o sistema</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use seu email e a senha cadastrada para este ambiente.
            </p>
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
            Não tem acesso? Solicite um convite ao administrador responsável pelo projeto.
          </div>
        </section>
      </div>
    </div>
  );
};
