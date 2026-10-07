import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ChevronRight, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchFormulas } from '../services/api';
import type { Formula } from '../types/physics';
import { MathView } from '../components/formulas/MathView';
import { Badge } from '../components/common/Badge';
import { Slider } from '../components/common/Slider';
import { Button } from '../components/common/Button';

const GRAVITY_G = 6.67430e-11;

function computeFormulaResult(
  calculatorType: string,
  values: Record<string, number>
): { result: number | null; unit: string; expression: string } {
  switch (calculatorType) {
    case 'velocidade-media': {
      const { 'Δs': ds, 'Δt': dt } = values;
      if (!dt) return { result: null, unit: 'm/s', expression: '' };
      const r = ds / dt;
      return { result: r, unit: 'm/s', expression: `${ds} / ${dt} = ${r.toFixed(3)}` };
    }
    case 'aceleracao-media': {
      const { v, 'v_0': v0, 'Δt': dt } = values;
      if (!dt) return { result: null, unit: 'm/s²', expression: '' };
      const r = (v - v0) / dt;
      return { result: r, unit: 'm/s²', expression: `(${v} - ${v0}) / ${dt} = ${r.toFixed(3)}` };
    }
    case 'mru-posicao': {
      const { 's_0': s0, v, t } = values;
      const r = s0 + v * t;
      return { result: r, unit: 'm', expression: `${s0} + ${v} · ${t} = ${r.toFixed(3)}` };
    }
    case 'mruv-velocidade': {
      const { 'v_0': v0, a, t } = values;
      const r = v0 + a * t;
      return { result: r, unit: 'm/s', expression: `${v0} + ${a} · ${t} = ${r.toFixed(3)}` };
    }
    case 'torricelli': {
      const { 'v_0': v0, a, 'Δs': ds } = values;
      const v2 = v0 * v0 + 2 * a * ds;
      if (v2 < 0) return { result: null, unit: 'm/s', expression: 'v² < 0: situação sem solução real' };
      const r = Math.sqrt(v2);
      return { result: r, unit: 'm/s', expression: `√(${v0}² + 2·${a}·${ds}) = √${v2.toFixed(2)} = ${r.toFixed(3)}` };
    }
    case 'alcance-projetil': {
      const { 'v_0': v0, 'θ': theta, g } = values;
      const r = (v0 * v0 * Math.sin((2 * theta * Math.PI) / 180)) / g;
      return { result: r, unit: 'm', expression: `(${v0}² · sin(2·${theta}°)) / ${g} = ${r.toFixed(3)}` };
    }
    case 'segunda-lei-newton': {
      const { m, a } = values;
      const r = m * a;
      return { result: r, unit: 'N', expression: `${m} · ${a} = ${r.toFixed(3)}` };
    }
    case 'forca-peso': {
      const { m, g } = values;
      const r = m * g;
      return { result: r, unit: 'N', expression: `${m} · ${g} = ${r.toFixed(3)}` };
    }
    case 'forca-atrito': {
      const { 'μ': mu, N } = values;
      const r = mu * N;
      return { result: r, unit: 'N', expression: `${mu} · ${N} = ${r.toFixed(3)}` };
    }
    case 'plano-inclinado': {
      const { m, 'θ': theta, 'μ': mu, g } = values;
      const rad = (theta * Math.PI) / 180;
      const N = m * g * Math.cos(rad);
      const Fpar = m * g * Math.sin(rad);
      const Fat = mu * N;
      const r = Fpar - Fat;
      return {
        result: r,
        unit: 'N',
        expression: `N = ${N.toFixed(2)} N | F_at = ${Fat.toFixed(2)} N | F_res = ${Fpar.toFixed(2)} - ${Fat.toFixed(2)} = ${r.toFixed(2)}`,
      };
    }
    case 'trabalho-mecanico': {
      const { F, d, 'θ': theta } = values;
      const r = F * d * Math.cos((theta * Math.PI) / 180);
      return { result: r, unit: 'J', expression: `${F} · ${d} · cos(${theta}°) = ${r.toFixed(3)}` };
    }
    case 'energia-cinetica': {
      const { m, v } = values;
      const r = 0.5 * m * v * v;
      return { result: r, unit: 'J', expression: `0.5 · ${m} · ${v}² = ${r.toFixed(3)}` };
    }
    case 'energia-potencial-gravitacional': {
      const { m, g, h } = values;
      const r = m * g * h;
      return { result: r, unit: 'J', expression: `${m} · ${g} · ${h} = ${r.toFixed(3)}` };
    }
    case 'quantidade-movimento': {
      const { m, v } = values;
      const r = m * v;
      return { result: r, unit: 'kg·m/s', expression: `${m} · ${v} = ${r.toFixed(3)}` };
    }
    case 'impulso': {
      const { F, 'Δt': dt } = values;
      const r = F * dt;
      return { result: r, unit: 'N·s', expression: `${F} · ${dt} = ${r.toFixed(4)}` };
    }
    case 'aceleracao-centripeta': {
      const { v, r } = values;
      const res = (v * v) / r;
      return { result: res, unit: 'm/s²', expression: `${v}² / ${r} = ${res.toFixed(3)}` };
    }
    case 'forca-centripeta': {
      const { m, v, r } = values;
      const res = (m * v * v) / r;
      return { result: res, unit: 'N', expression: `(${m} · ${v}²) / ${r} = ${res.toFixed(3)}` };
    }
    case 'periodo-frequencia': {
      const { r, v } = values;
      const T = (2 * Math.PI * r) / v;
      const f = 1 / T;
      return { result: T, unit: 's (T) | Hz (f)', expression: `T = 2π·${r} / ${v} = ${T.toFixed(3)} s | f = ${f.toFixed(4)} Hz` };
    }
    case 'gravitacao-universal': {
      const { 'm_1': m1, 'm_2': m2, r } = values;
      const F = (GRAVITY_G * m1 * m2) / (r * r);
      return {
        result: F,
        unit: 'N',
        expression: `G·m₁·m₂ / r² = ${GRAVITY_G.toExponential(4)}·${m1.toExponential(3)}·${m2.toExponential(3)} / ${(r * r).toExponential(3)} = ${F.toExponential(4)}`,
      };
    }
    case 'campo-gravitacional': {
      const { M, r } = values;
      const g = (GRAVITY_G * M) / (r * r);
      return {
        result: g,
        unit: 'm/s²',
        expression: `G·M / r² = ${GRAVITY_G.toExponential(3)}·${M.toExponential(3)} / ${(r * r).toExponential(3)} = ${g.toFixed(4)}`,
      };
    }
    default:
      return { result: null, unit: '', expression: '' };
  }
}

const topicColorMap: Record<string, string> = {
  cinematica: 'blue',
  dinamica: 'indigo',
  'leis-de-newton': 'emerald',
  'trabalho-energia': 'amber',
  'quantidade-movimento': 'purple',
  'movimento-circular': 'cyan',
  gravitacao: 'violet',
};

const badgeVariantMap: Record<string, 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'slate'> = {
  Cinemática: 'blue',
  Dinâmica: 'slate',
  'Leis de Newton': 'emerald',
  'Trabalho e Energia': 'amber',
  'Quantidade de Movimento': 'purple',
  'Movimento Circular': 'blue',
  Gravitação: 'purple',
};

const FormulaCalculator: React.FC<{ formula: Formula }> = ({ formula }) => {
  const initValues = Object.fromEntries(
    formula.variables.map((v) => [v.symbol, v.defaultValue])
  );
  const [values, setValues] = useState<Record<string, number>>(initValues);

  const { result, unit, expression } = computeFormulaResult(formula.calculatorType, values);

  const resetValues = () => setValues(initValues);

  const updateValue = (symbol: string, val: number) => {
    setValues((prev) => ({ ...prev, [symbol]: val }));
  };

  return (
    <div id={formula.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{formula.name}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formula.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={badgeVariantMap[formula.topic] || 'slate'}>{formula.topic}</Badge>
          <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={resetValues} aria-label="Resetar valores">
            Reset
          </Button>
        </div>
      </div>

      {/* Expression */}
      <div className="px-5 py-4 flex justify-center bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
        <MathView math={formula.expression} displayMode />
      </div>

      <div className="grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
        {/* Sliders */}
        <div className="p-5 space-y-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Parâmetros</p>
          {formula.variables.map((v) => (
            <Slider
              key={v.symbol}
              label={`${v.symbol} – ${v.name}`}
              value={values[v.symbol]}
              min={v.min ?? 0}
              max={v.max ?? 100}
              step={v.step ?? 1}
              unit={v.unit}
              onChange={(val) => updateValue(v.symbol, val)}
              description={v.description}
            />
          ))}
        </div>

        {/* Result */}
        <div className="p-5 flex flex-col">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Resultado</p>

          <div className="flex-1 flex flex-col items-center justify-center text-center py-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
            {result !== null ? (
              <>
                <p className="text-4xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                  {Math.abs(result) >= 1e6 || (Math.abs(result) < 0.001 && result !== 0)
                    ? result.toExponential(4)
                    : result.toFixed(4).replace(/\.?0+$/, '')}
                </p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{unit}</p>
                <div className="mt-4 text-xs font-mono bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 break-all max-w-full">
                  {expression}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-rose-500">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">Valor inválido. Verifique os parâmetros.</p>
              </div>
            )}
          </div>

          {/* Variables table */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Variáveis e Unidades</p>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    <th className="text-left px-3 py-1.5 font-semibold text-slate-500 dark:text-slate-400">Símbolo</th>
                    <th className="text-left px-3 py-1.5 font-semibold text-slate-500 dark:text-slate-400">Valor Atual</th>
                    <th className="text-left px-3 py-1.5 font-semibold text-slate-500 dark:text-slate-400">Unidade</th>
                  </tr>
                </thead>
                <tbody>
                  {formula.variables.map((v) => (
                    <tr key={v.symbol} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-1.5 font-mono font-bold text-blue-600 dark:text-blue-400">{v.symbol}</td>
                      <td className="px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300">
                        {typeof values[v.symbol] === 'number' && (Math.abs(values[v.symbol]) >= 1e6 || (Math.abs(values[v.symbol]) < 0.001 && values[v.symbol] !== 0))
                          ? values[v.symbol].toExponential(3)
                          : values[v.symbol]}
                      </td>
                      <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">{v.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FormulasPage: React.FC = () => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('todos');

  useEffect(() => {
    fetchFormulas().then((f) => {
      setFormulas(f);
      setLoading(false);
    });
  }, []);

  const topics = ['todos', ...Array.from(new Set(formulas.map((f) => f.topic)))];
  const filtered = selectedTopic === 'todos' ? formulas : formulas.filter((f) => f.topic === selectedTopic);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Início</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-medium text-slate-700 dark:text-slate-300">Catálogo de Fórmulas</span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Catálogo de Fórmulas</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Calculadoras interativas com sliders — altere os valores e veja os resultados em tempo real
            </p>
          </div>
        </div>
      </div>

      {/* Topic filter */}
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              selectedTopic === t
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-700'
            }`}
          >
            {t === 'todos' ? 'Todos' : t}
          </button>
        ))}
      </div>

      {/* Formulas */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Calculator className="w-6 h-6 animate-pulse mr-2" />
          Carregando fórmulas...
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((formula) => (
            <FormulaCalculator key={formula.id} formula={formula} />
          ))}
        </div>
      )}
    </div>
  );
};
