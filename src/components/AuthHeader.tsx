import React, { useState } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
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
    <div className="mx-auto max-w-7xl rounded-[24px] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <UserIcon size={15} className="text-slate-400" />
          <span className="font-medium text-slate-900">{userName}</span>
        </div>

        <button
          onClick={() => void handleLogout()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
