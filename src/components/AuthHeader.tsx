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
    <div className="mx-auto max-w-7xl rounded-[20px] border border-white/70 bg-white/82 px-3 py-2.5 shadow-[0_12px_28px_rgba(15,23,42,0.04)] backdrop-blur sm:rounded-[24px] sm:px-4 sm:py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5 text-sm text-slate-600">
          <UserIcon size={15} className="shrink-0 text-slate-400" />
          <span className="truncate font-medium text-slate-900">{userName}</span>
        </div>

        <button
          onClick={() => void handleLogout()}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[16px] border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-2xl sm:px-4 sm:py-2.5"
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
