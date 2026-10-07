import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play, ChevronRight, BookOpen, Calculator, Loader2, AlertCircle, Cpu
} from 'lucide-react';
import { fetchSimulationById } from '../services/api';
import type { SimulationMeta } from '../types/physics';
import { Badge } from '../components/common/Badge';

import { ProjectileSimulation } from '../simulations/ProjectileSimulation';
import { InclinedPlaneSimulation } from '../simulations/InclinedPlaneSimulation';
import { NewtonLawSimulation } from '../simulations/NewtonLawSimulation';
import { CollisionSimulation } from '../simulations/CollisionSimulation';
import { CircularMotionSimulation } from '../simulations/CircularMotionSimulation';
import { GravitationSimulation } from '../simulations/GravitationSimulation';

const simComponents: Record<string, React.FC> = {
  'lancamento-projetil': ProjectileSimulation,
  'plano-inclinado': InclinedPlaneSimulation,
  'leis-de-newton': NewtonLawSimulation,
  'colisoes': CollisionSimulation,
  'movimento-circular': CircularMotionSimulation,
  'gravitacao': GravitationSimulation,
};

const diffBadge: Record<string, 'emerald' | 'amber' | 'rose'> = {
  'Iniciante': 'emerald',
  'Intermediário': 'amber',
  'Avançado': 'rose',
};

export const SimulationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<SimulationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchSimulationById(id).then((s) => {
      setMeta(s);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-80 gap-3 text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span>Carregando simulação...</span>
    </div>
  );

  if (!meta || !id) return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <AlertCircle className="w-12 h-12 mx-auto text-rose-400 mb-3" />
      <h2 className="text-xl font-bold mb-2">Simulação não encontrada</h2>
      <Link to="/simulacoes" className="text-blue-600 hover:underline">← Todas as simulações</Link>
    </div>
  );

  const SimComponent = simComponents[id];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Início</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/simulacoes" className="hover:text-blue-600 dark:hover:text-blue-400">Simulações</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="font-medium text-slate-700 dark:text-slate-300">{meta.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple">{meta.badge}</Badge>
            <Badge variant={diffBadge[meta.difficulty] || 'slate'}>{meta.difficulty}</Badge>
            <Badge variant="slate">{meta.topicName}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">{meta.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">{meta.description}</p>
        </div>
        <Link
          to={`/mecanica/${meta.topicSlug}`}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Ver tópico completo
        </Link>
      </div>

      {/* Key Concepts */}
      <div className="grid sm:grid-cols-2 gap-3">
        {meta.keyConcepts.map((c, i) => (
          <div key={i} className="flex items-start gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300">
            <Cpu className="w-4 h-4 flex-shrink-0 text-purple-500 mt-0.5" />
            <span>{c}</span>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">Como usar esta simulação</p>
        <ol className="space-y-1">
          {meta.instructions.map((instr, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-blue-800 dark:text-blue-200">
              <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-[10px] font-bold">{i + 1}</span>
              <span>{instr}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Simulation Component */}
      {SimComponent ? (
        <SimComponent />
      ) : (
        <div className="flex items-center justify-center min-h-48 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Simulação em desenvolvimento...</span>
        </div>
      )}

      {/* Formulas reference */}
      {meta.formulasUsed.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" />
            Fórmulas Utilizadas
          </p>
          <div className="flex flex-wrap gap-2">
            {meta.formulasUsed.map((fid) => (
              <Link
                key={fid}
                to={`/formulas#${fid}`}
                className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 px-2.5 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
              >
                {fid}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
