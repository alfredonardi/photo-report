import React from 'react';
import { User } from '../hooks/useAuth';
import { LogOut, User as UserIcon } from 'lucide-react';

interface AuthHeaderProps {
  user: User;
  onLogout: () => void;
}

/**
 * Header com informações do usuário e botão de logout
 */
export const AuthHeader: React.FC<AuthHeaderProps> = ({ user, onLogout }) => {
  const userName = user.user_metadata?.full_name || user.email;

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
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600
                   hover:bg-red-50 rounded-lg transition-colors border border-red-200
                   hover:border-red-300 active:bg-red-100"
          title="Sair do sistema"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </div>
  );
};
