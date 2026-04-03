import React from 'react';

export const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-6 px-2 py-3 text-center sm:mt-8 sm:rounded-[28px] sm:border sm:border-white/70 sm:bg-white/75 sm:px-6 sm:py-5 sm:shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:backdrop-blur">
      <p className="text-sm text-slate-600">
        Desenvolvido por <span className="font-semibold text-slate-900">Alfredo Nardi</span>
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">
        © {currentYear} Todos os direitos reservados
      </p>
    </footer>
  );
};
