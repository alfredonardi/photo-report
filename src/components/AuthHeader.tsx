import React, { useState } from 'react';
import { User } from '../hooks/useAuth';
import { LogOut, User as UserIcon } from 'lucide-react';

interface AuthHeaderProps {
  user: User;
  onLogout: () => Promise<void>;
}

/**
 * Header com informações do usuário e botão de logout
 */
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
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Informações do usuário */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <UserIcon size={16} className="text-gray-500" />
          <span className="font-medium">{userName}</span>
        </div>

        {/* Botão de logout */}
        <button
          onClick={() => void handleLogout()}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600
                    hover:bg-red-50 rounded-lg transition-colors border border-red-200
                    hover:border-red-300 active:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Sair do sistema"
          disabled={isLoggingOut}
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
        </button>
      </div>
    </div>
  );
};
