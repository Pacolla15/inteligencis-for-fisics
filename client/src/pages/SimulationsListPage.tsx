import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronRight, Cpu, Rocket, Gauge, Atom, Compass, Orbit, Scale } from 'lucide-react';
import { fetchSimulations } from '../services/api';
import type { SimulationMeta } from '../types/physics';
import { Badge } from '../components/common/Badge';

const simIcons: Record<string, React.FC<{ className?: string }>> = {
  'lancamento-projetil': Rocket,
  'plano-inclinado': Gauge,
  'leis-de-newton': Atom,
  'colisoes': Compass,
  'movimento-circular': Orbit,
  'gravitacao': Scale,
};

const diffBadge: Record<string, 'emerald' | 'amber' | 'rose'> = {
  'Iniciante': 'emerald',
  'Intermediário': 'amber',
  'Avançado': 'rose',
};

export const SimulationsListPage: React.FC = () => {
  const [sims, setSims] = useState<SimulationMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimulations().then((s) => { setSims(s); setLoading(false); });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Início</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-medium text-slate-700 dark:text-slate-300">Simulações Interativas</span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Simulações Interativas</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Manipule parâmetros físicos e observe os fenômenos em tempo real
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Cpu className="w-6 h-6 animate-pulse mr-2" />
          Carregando simulações...
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sims.map((sim) => {
            const Icon = simIcons[sim.id] || Cpu;
            return (
              <Link
                key={sim.id}
                to={`/simulacoes/${sim.id}`}
                className="group flex flex-col p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-purple-400 dark:hover:border-purple-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant={diffBadge[sim.difficulty] || 'slate'} size="sm">{sim.difficulty}</Badge>
                </div>

                <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{sim.title}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">{sim.description}</p>

                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="slate" size="sm">{sim.topicName}</Badge>
                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-3.5 h-3.5" />
                    Iniciar
                  </span>
                </div>

                <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Conceitos-chave</p>
                  <div className="flex flex-wrap gap-1">
                    {sim.keyConcepts.slice(0, 2).map((c, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full truncate max-w-[160px]">
                        {c.length > 35 ? c.slice(0, 35) + '…' : c}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
