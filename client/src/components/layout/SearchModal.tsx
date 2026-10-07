import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, BookOpen, Calculator, Play, Lightbulb, Loader2 } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { searchGlobal } from '../../services/api';
import type { SearchResult } from '../../types/physics';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch } = useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isSearchOpen]);

  const handleSearch = useCallback((q: string) => {
    clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const res = await searchGlobal(q);
      setResults(res);
      setLoading(false);
    }, 300);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    handleSearch(e.target.value);
  };

  const goTo = (path: string) => {
    navigate(path);
    closeSearch();
  };

  const totalResults = results
    ? results.topics.length + results.formulas.length + results.simulations.length + results.concepts.length
    : 0;

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={closeSearch}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Busca global"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10"
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          {loading ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Buscar fórmulas, conceitos, simulações..."
            aria-label="Campo de busca"
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults(null); inputRef.current?.focus(); }}
              aria-label="Limpar busca"
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>Digite para pesquisar fórmulas, tópicos e simulações</p>
              <p className="text-xs mt-1 text-slate-400">Ex: "velocidade", "força", "colisão"</p>
            </div>
          )}

          {query && !loading && totalResults === 0 && (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
              <p>Nenhum resultado encontrado para <strong>"{query}"</strong></p>
            </div>
          )}

          {results && totalResults > 0 && (
            <div className="p-2 space-y-1">
              {/* Tópicos */}
              {results.topics.length > 0 && (
                <ResultSection title="Tópicos" icon={<BookOpen className="w-3.5 h-3.5" />}>
                  {results.topics.map((t) => (
                    <ResultItem
                      key={t.id}
                      title={t.title}
                      subtitle={t.tagline}
                      badge="Tópico"
                      badgeColor="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                      onClick={() => goTo(`/mecanica/${t.slug}`)}
                    />
                  ))}
                </ResultSection>
              )}

              {/* Fórmulas */}
              {results.formulas.length > 0 && (
                <ResultSection title="Fórmulas" icon={<Calculator className="w-3.5 h-3.5" />}>
                  {results.formulas.map((f) => (
                    <ResultItem
                      key={f.id}
                      title={f.name}
                      subtitle={f.topic}
                      badge="Fórmula"
                      badgeColor="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      onClick={() => goTo(`/formulas#${f.id}`)}
                    />
                  ))}
                </ResultSection>
              )}

              {/* Simulações */}
              {results.simulations.length > 0 && (
                <ResultSection title="Simulações" icon={<Play className="w-3.5 h-3.5" />}>
                  {results.simulations.map((s) => (
                    <ResultItem
                      key={s.id}
                      title={s.title}
                      subtitle={s.topicName}
                      badge={s.difficulty}
                      badgeColor="bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                      onClick={() => goTo(`/simulacoes/${s.id}`)}
                    />
                  ))}
                </ResultSection>
              )}

              {/* Conceitos */}
              {results.concepts.length > 0 && (
                <ResultSection title="Conceitos Fundamentais" icon={<Lightbulb className="w-3.5 h-3.5" />}>
                  {results.concepts.map((c) => (
                    <ResultItem
                      key={c.id}
                      title={c.title}
                      subtitle={c.topicTitle}
                      badge="Conceito"
                      badgeColor="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      onClick={() => goTo(`/mecanica/${c.topicSlug}`)}
                    />
                  ))}
                </ResultSection>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          <span>
            {query && !loading && `${totalResults} resultado${totalResults !== 1 ? 's' : ''}`}
          </span>
          <span>
            <kbd className="font-mono border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 bg-white dark:bg-slate-900 mr-1">Esc</kbd>
            para fechar
          </span>
        </div>
      </div>
    </div>
  );
};

const ResultSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  title, icon, children,
}) => (
  <div className="pt-1">
    <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      {icon}
      <span>{title}</span>
    </div>
    {children}
  </div>
);

const ResultItem: React.FC<{
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  onClick: () => void;
}> = ({ title, subtitle, badge, badgeColor, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left group cursor-pointer"
  >
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{title}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</div>
    </div>
    <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
      {badge}
    </span>
    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
  </button>
);
