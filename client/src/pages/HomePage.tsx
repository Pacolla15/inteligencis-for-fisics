import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Activity,
  Gauge,
  Atom,
  Sparkles,
  Compass,
  Orbit,
  Scale,
  Play,
  Sliders,
  BookOpen,
  Rocket,
  ChevronRight,
  FlaskConical,
  BarChart3,
  Calculator,
} from 'lucide-react';

const topicCards = [
  {
    slug: 'cinematica',
    title: 'Cinemática',
    description: 'Posição, deslocamento, velocidade e aceleração. MRU, MRUV e lançamentos.',
    icon: Activity,
    color: 'blue',
    concepts: 8,
  },
  {
    slug: 'dinamica',
    title: 'Dinâmica',
    description: 'Forças, atrito, tensão, plano inclinado e diagrama de corpo livre.',
    icon: Gauge,
    color: 'indigo',
    concepts: 7,
  },
  {
    slug: 'leis-de-newton',
    title: 'Leis de Newton',
    description: 'Princípio da inércia, F = ma e ação-reação. Fundamentos da mecânica.',
    icon: Atom,
    color: 'emerald',
    concepts: 6,
  },
  {
    slug: 'trabalho-energia',
    title: 'Trabalho e Energia',
    description: 'Trabalho mecânico, energia cinética, potencial e conservação da energia.',
    icon: Sparkles,
    color: 'amber',
    concepts: 7,
  },
  {
    slug: 'quantidade-movimento',
    title: 'Quantidade de Movimento',
    description: 'Momento linear, impulso, colisões elásticas e inelásticas.',
    icon: Compass,
    color: 'purple',
    concepts: 6,
  },
  {
    slug: 'movimento-circular',
    title: 'Movimento Circular',
    description: 'Período, frequência, velocidade angular, aceleração e força centrípeta.',
    icon: Orbit,
    color: 'cyan',
    concepts: 6,
  },
  {
    slug: 'gravitacao',
    title: 'Gravitação',
    description: 'Lei de Newton, campo gravitacional, órbitas e Leis de Kepler.',
    icon: Scale,
    color: 'violet',
    concepts: 6,
  },
];

const simulationHighlights = [
  {
    id: 'lancamento-projetil',
    title: 'Lançamento de Projéteis',
    description: 'Trajetória parabólica com vetores de velocidade e aceleração em tempo real.',
    topic: 'Cinemática',
    difficulty: 'Iniciante',
    icon: Rocket,
    color: 'blue',
  },
  {
    id: 'plano-inclinado',
    title: 'Plano Inclinado',
    description: 'Decomposição de forças, atrito estático e cinético em rampas variáveis.',
    topic: 'Dinâmica',
    difficulty: 'Intermediário',
    icon: Gauge,
    color: 'indigo',
  },
  {
    id: 'colisoes',
    title: 'Colisões 1D',
    description: 'Choques elásticos e inelásticos com conservação do momento linear.',
    topic: 'Qtd. de Movimento',
    difficulty: 'Intermediário',
    icon: Compass,
    color: 'purple',
  },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:border-blue-400 dark:hover:border-blue-700',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 hover:border-indigo-400 dark:hover:border-indigo-700',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 hover:border-emerald-400 dark:hover:border-emerald-700',
  amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 hover:border-amber-400 dark:hover:border-amber-700',
  purple: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 hover:border-purple-400 dark:hover:border-purple-700',
  cyan: 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-900 text-cyan-700 dark:text-cyan-300 hover:border-cyan-400 dark:hover:border-cyan-700',
  violet: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900 text-violet-700 dark:text-violet-300 hover:border-violet-400 dark:hover:border-violet-700',
};

const iconBgMap: Record<string, string> = {
  blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
  cyan: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400',
  violet: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',
};

export const HomePage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Plataforma Educacional de Física Interativa</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
            Aprenda Física através da{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500">
              experimentação
            </span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Explore a Mecânica Clássica com fórmulas detalhadas, exemplos resolvidos passo a passo
            e simulações interativas onde você manipula os parâmetros e observa os resultados em tempo real.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/mecanica/cinematica"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explorar Mecânica</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/simulacoes"
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-xl shadow-sm transition-all hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 text-blue-500" />
              <span>Ver Simulações</span>
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {[
            { icon: Calculator, label: '18+ Fórmulas' },
            { icon: Sliders, label: '6 Simulações 2D' },
            { icon: BarChart3, label: 'Gráficos em Tempo Real' },
            { icon: BookOpen, label: 'Exemplos Resolvidos' },
            { icon: FlaskConical, label: '7 Tópicos de Mecânica' },
          ].map((pill) => {
            const Icon = pill.icon;
            return (
              <span
                key={pill.label}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-blue-500" />
                {pill.label}
              </span>
            );
          })}
        </div>
      </section>

      {/* Topics Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Assuntos de Mecânica
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Selecione um tópico para explorar conceitos, fórmulas e simulações
            </p>
          </div>
          <Link
            to="/mecanica/cinematica"
            className="hidden sm:flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {topicCards.map((topic) => {
            const Icon = topic.icon;
            return (
              <Link
                key={topic.slug}
                to={`/mecanica/${topic.slug}`}
                className={`group flex flex-col p-4 rounded-xl border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${colorMap[topic.color]}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${iconBgMap[topic.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium opacity-70">{topic.concepts} conceitos</span>
                </div>
                <h3 className="font-bold text-sm mb-1 text-slate-900 dark:text-slate-100">{topic.title}</h3>
                <p className="text-xs leading-relaxed opacity-80 flex-1">{topic.description}</p>
                <div className="flex items-center gap-1 mt-3 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explorar</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Simulations Highlights */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Simulações em Destaque
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Manipule parâmetros e observe os fenômenos físicos em tempo real
            </p>
          </div>
          <Link
            to="/simulacoes"
            className="hidden sm:flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {simulationHighlights.map((sim) => {
            const Icon = sim.icon;
            return (
              <Link
                key={sim.id}
                to={`/simulacoes/${sim.id}`}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden"
              >
                {/* Decorative gradient */}
                <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-full ${
                  sim.color === 'blue' ? 'bg-blue-500' :
                  sim.color === 'indigo' ? 'bg-indigo-500' : 'bg-purple-500'
                }`} />

                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconBgMap[sim.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{sim.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{sim.description}</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {sim.topic}
                    </span>
                    <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                      {sim.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-3.5 h-3.5" />
                    <span>Iniciar</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 text-center mb-8">
          Metodologia de Aprendizagem
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 items-center">
          {[
            { step: '01', label: 'Conceito', color: 'blue' },
            { step: '→', label: '', color: '' },
            { step: '02', label: 'Fórmula', color: 'emerald' },
            { step: '→', label: '', color: '' },
            { step: '03', label: 'Exemplo', color: 'amber' },
            { step: '→', label: '', color: '' },
            { step: '04', label: 'Simulação', color: 'purple' },
          ].map((item, i) =>
            item.label ? (
              <div key={i} className="text-center">
                <div
                  className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-bold text-lg ${
                    item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' :
                    item.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' :
                    item.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' :
                    'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {item.step}
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2">{item.label}</p>
              </div>
            ) : (
              <div key={i} className="hidden sm:flex justify-center text-slate-300 dark:text-slate-700 text-2xl font-light">
                →
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
};
