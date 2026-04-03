import React from 'react';

export const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 rounded-[28px] border border-white/70 bg-white/75 px-6 py-5 text-center shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur">
      <p className="text-sm text-slate-600">
        Desenvolvido por <span className="font-semibold text-slate-900">Alfredo Nardi</span>
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">
        © {currentYear} Todos os direitos reservados
      </p>
    </footer>
  );
};
