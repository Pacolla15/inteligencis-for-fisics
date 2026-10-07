import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Activity,
  Gauge,
  Atom,
  Sparkles,
  Compass,
  Orbit,
  Scale,
  Calculator,
  Sliders,
  BookOpen,
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const topics = [
    { name: 'Cinemática', path: '/mecanica/cinematica', icon: Activity },
    { name: 'Dinâmica', path: '/mecanica/dinamica', icon: Gauge },
    { name: 'Leis de Newton', path: '/mecanica/leis-de-newton', icon: Atom },
    { name: 'Trabalho e Energia', path: '/mecanica/trabalho-energia', icon: Sparkles },
    { name: 'Quantidade de Movimento', path: '/mecanica/quantidade-movimento', icon: Compass },
    { name: 'Movimento Circular', path: '/mecanica/movimento-circular', icon: Orbit },
    { name: 'Gravitação', path: '/mecanica/gravitacao', icon: Scale },
  ];

  const mainLinks = [
    { name: 'Início', path: '/', icon: Home },
    { name: 'Simulações Interativas', path: '/simulacoes', icon: Sliders },
    { name: 'Catálogo de Fórmulas', path: '/formulas', icon: Calculator },
  ];

  return (
    <aside className="w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between select-none">
      <div className="p-5 flex-1 overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Atom className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
              PhysicsLab
            </h1>
            <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
              Mecânica Interativa
            </span>
          </div>
        </div>

        {/* Principal */}
        <div className="space-y-1 mb-6">
          <div className="px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-600 dark:text-slate-400 mb-2">
            Navegação Principal
          </div>
          {mainLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Assuntos de Mecânica */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mecânica Clássica</span>
          </div>
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <NavLink
                key={topic.path}
                to={topic.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-2 border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{topic.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-300">Educação Científica Aberta</p>
        <p className="text-[11px] mt-0.5">Fórmulas, simulações e gráficos</p>
      </div>
    </aside>
  );
};
