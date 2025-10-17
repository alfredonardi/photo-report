import React from 'react';

export const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 pt-6 pb-4 border-t border-gray-200">
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Desenvolvido por <span className="font-semibold text-gray-800">Alfredo Nardi</span>
        </p>
        <p className="text-xs text-gray-500">
          © {currentYear} Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
};
