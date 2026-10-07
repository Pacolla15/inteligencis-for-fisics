import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Search, Menu, X, Atom, Github } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSearch } from '../../context/SearchContext';
import { Button } from '../common/Button';

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { openSearch } = useSearch();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md h-14 flex items-center px-4 gap-3 shadow-sm">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
        className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Brand (mobile only) */}
      <Link to="/" className="flex lg:hidden items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <Atom className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">PhysicsLab</span>
      </Link>

      <div className="flex-1" />

      {/* Search trigger */}
      <button
        onClick={openSearch}
        aria-label="Pesquisar fórmulas, conceitos e simulações"
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 transition-colors cursor-pointer min-w-[160px] sm:min-w-[220px]"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left truncate">Buscar...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5">
          Ctrl K
        </kbd>
      </button>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
        className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* GitHub link */}
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Código-fonte no GitHub"
        className="hidden sm:flex p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Github className="w-5 h-5" />
      </a>
    </header>
  );
};
