import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen, Lightbulb, Calculator, Play, ChevronRight,
  CheckCircle, XCircle, HelpCircle, Loader2, AlertCircle
} from 'lucide-react';
import { fetchTopicBySlug, fetchFormulas, fetchSimulationById } from '../services/api';
import type { Topic, Formula } from '../types/physics';
import { MathView } from '../components/formulas/MathView';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

const colorToTailwind: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-900', iconBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-900', iconBg: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900', iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900', iconBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-900', iconBg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-950/20', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-900', iconBg: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-300' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/20', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-900', iconBg: 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300' },
};

const challengeAnswers: Record<string, number> = {};

export const TopicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const [t, f] = await Promise.all([
          fetchTopicBySlug(slug),
          fetchFormulas(slug),
        ]);
        if (!t) throw new Error('Tópico não encontrado');
        setTopic(t);
        setFormulas(f);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar tópico.');
      } finally {
        setLoading(false);
      }
    };
    load();
    setAnswers({});
    setShowAnswers({});
  }, [slug]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-80 gap-3 text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span>Carregando tópico...</span>
    </div>
  );

  if (error || !topic) return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <AlertCircle className="w-12 h-12 mx-auto text-rose-400 mb-3" />
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Tópico não encontrado</h2>
      <p className="text-slate-500 mb-4">{error}</p>
      <Link to="/" className="text-blue-600 hover:underline font-medium">← Voltar ao início</Link>
    </div>
  );

  const colors = colorToTailwind[topic.color] || colorToTailwind.blue;
  const topicFormulas = formulas.filter((f) => topic.formulaIds.includes(f.id));

  const handleAnswer = (challengeId: string, optionIdx: number) => {
    if (answers[challengeId] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [challengeId]: optionIdx }));
    setShowAnswers((prev) => ({ ...prev, [challengeId]: true }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Início</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="font-medium text-slate-700 dark:text-slate-300">{topic.title}</span>
      </nav>

      {/* Header */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${colors.bg} ${colors.border}`}>
        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${colors.iconBg} mb-3`}>
          <BookOpen className="w-3.5 h-3.5" />
          Mecânica Clássica
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 mb-2">{topic.title}</h1>
        <p className={`text-base font-medium ${colors.text} mb-3`}>{topic.tagline}</p>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">{topic.introduction}</p>

        <div className="flex flex-wrap gap-3 mt-5">
          <span className="text-xs font-medium bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full">
            {topic.conceptsCount} conceitos fundamentais
          </span>
          <span className="text-xs font-medium bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full">
            {topicFormulas.length} fórmulas
          </span>
          <span className="text-xs font-medium bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full">
            {topic.relatedSimulationIds.length} simulação(ões)
          </span>
        </div>
      </div>

      {/* Conceitos Fundamentais */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Conceitos Fundamentais
        </h2>
        <div className="space-y-3">
          {topic.fundamentalConcepts.map((concept, i) => (
            <details key={concept.id} className="group" open={i === 0}>
              <summary className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-700 transition-colors list-none">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-bold ${colors.iconBg}`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{concept.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{concept.summary}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform flex-shrink-0" />
              </summary>
              <div className="mt-1 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 border-t-0 rounded-b-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                <p>{concept.detail}</p>
                {concept.keyRule && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200 text-xs">
                    <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                    <p><strong>Regra:</strong> {concept.keyRule}</p>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Fórmulas */}
      {topicFormulas.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-500" />
            Fórmulas Principais
          </h2>
          <div className="space-y-4">
            {topicFormulas.map((formula) => (
              <div
                key={formula.id}
                id={formula.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{formula.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formula.description}</p>
                  </div>
                  <Badge variant="slate">{formula.topic}</Badge>
                </div>

                {/* Expression */}
                <div className="p-5 flex justify-center bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <MathView math={formula.expression} displayMode />
                </div>

                {/* Variables table */}
                <div className="p-4">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Variáveis</p>
                  <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-slate-400">Símbolo</th>
                          <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-slate-400">Grandeza</th>
                          <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-slate-400">Unidade (SI)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formula.variables.map((v) => (
                          <tr key={v.symbol} className="border-t border-slate-100 dark:border-slate-800">
                            <td className="px-3 py-2 font-mono font-bold text-blue-600 dark:text-blue-400">{v.symbol}</td>
                            <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{v.name}</td>
                            <td className="px-3 py-2 font-mono text-slate-500 dark:text-slate-400">{v.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                    Resultado em: <strong>{formula.units}</strong>
                  </p>
                </div>

                {/* Example */}
                <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-amber-50/50 dark:bg-amber-950/10">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">Exemplo Resolvido</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-2">{formula.example.problem}</p>
                  <ol className="space-y-1">
                    {formula.example.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-[10px] font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      Resultado: {formula.example.result}
                    </p>
                  </div>
                </div>

                {/* CTA for calculator/simulation */}
                <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-end gap-2">
                  <Link
                    to={`/formulas#${formula.id}`}
                    className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    Calculadora interativa
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Simulações relacionadas */}
      {topic.relatedSimulationIds.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-500" />
            Simulações Interativas
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {topic.relatedSimulationIds.map((simId) => (
              <Link
                key={simId}
                to={`/simulacoes/${simId}`}
                className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-purple-400 dark:hover:border-purple-700 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 capitalize">
                    {simId.replace(/-/g, ' ')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Simulação interativa com controles em tempo real</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-purple-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Desafios */}
      {topic.challenges.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-rose-500" />
            Desafios
          </h2>
          <div className="space-y-4">
            {topic.challenges.map((challenge) => {
              const answered = answers[challenge.id] !== undefined;
              const isCorrect = answered && answers[challenge.id] === challenge.correctOption;

              return (
                <div
                  key={challenge.id}
                  className={`p-5 rounded-xl border-2 transition-colors ${
                    !answered
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    {challenge.question}
                  </p>

                  {/* Hint */}
                  {!answered && (
                    <p className="text-xs italic text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-400" />
                      Dica: {challenge.hint}
                    </p>
                  )}

                  {/* Options */}
                  {challenge.options && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {challenge.options.map((opt, idx) => {
                        let optStyle = 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer';
                        if (answered) {
                          if (idx === challenge.correctOption)
                            optStyle = 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-500 text-emerald-800 dark:text-emerald-200';
                          else if (idx === answers[challenge.id])
                            optStyle = 'bg-rose-100 dark:bg-rose-900/40 border-rose-500 text-rose-800 dark:text-rose-200';
                          else
                            optStyle = 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 text-slate-500 opacity-50';
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(challenge.id, idx)}
                            disabled={answered}
                            className={`p-3 rounded-lg border-2 text-xs font-medium transition-all text-left flex items-center gap-2 ${optStyle}`}
                          >
                            <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation */}
                  {answered && (
                    <div className={`flex items-start gap-2 p-3 rounded-lg border text-xs mt-2 ${
                      isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      )}
                      <p>{challenge.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
