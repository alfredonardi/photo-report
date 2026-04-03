import React, { useState } from 'react';
import { LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User } from '../hooks/useAuth';

interface AuthHeaderProps {
  user: User;
  onLogout: () => Promise<void>;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ user, onLogout }) => {
  const userName = user.user_metadata?.full_name || user.email;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl rounded-[28px] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sessão autenticada</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <UserIcon size={15} className="text-slate-400" />
              <span className="font-medium text-slate-900">{userName}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => void handleLogout()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          title="Sair do sistema"
          disabled={isLoggingOut}
        >
          <LogOut size={16} />
          {isLoggingOut ? 'Saindo...' : 'Encerrar sessão'}
        </button>
      </div>
    </div>
  );
};
