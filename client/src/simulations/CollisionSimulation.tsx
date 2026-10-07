import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Info } from 'lucide-react';
import { Slider } from '../common/Slider';
import { Button } from '../common/Button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

interface State {
  vA: number;
  vB: number;
  xA: number;
  xB: number;
  mA: number;
  mB: number;
  collided: boolean;
  phase: 'before' | 'colliding' | 'after';
}

function computeElastic(mA: number, vA: number, mB: number, vB: number) {
  const v1f = ((mA - mB) * vA + 2 * mB * vB) / (mA + mB);
  const v2f = ((mB - mA) * vB + 2 * mA * vA) / (mA + mB);
  return { v1f, v2f };
}

function computeInelastic(mA: number, vA: number, mB: number, vB: number) {
  const vf = (mA * vA + mB * vB) / (mA + mB);
  return { vf };
}

export const CollisionSimulation: React.FC = () => {
  const animRef = useRef<number>(0);
  const runningRef = useRef(false);
  const stateRef = useRef<State | null>(null);
  const lastTimeRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mA, setMA] = useState(2);
  const [mB, setMB] = useState(2);
  const [vAInit, setVAInit] = useState(4);
  const [vBInit, setVBInit] = useState(-2);
  const [type, setType] = useState<'elastic' | 'inelastic'>('elastic');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    pBefore: number; pAfter: number; keBefore: number; keAfter: number;
    vAfterA: number; vAfterB: number;
  } | null>(null);

  const initState = useCallback((): State => ({
    xA: 80, xB: 460,
    vA: vAInit, vB: vBInit,
    mA, mB, collided: false, phase: 'before',
  }), [mA, mB, vAInit, vBInit]);

  const draw = useCallback((s: State) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const isDark = document.documentElement.classList.contains('dark');

    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // Ground
    const groundY = H - 30;
    ctx.fillStyle = isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)';
    ctx.fillRect(0, groundY, W, 30);
    ctx.strokeStyle = isDark ? '#059669' : '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();

    const drawBlock = (x: number, mass: number, vel: number, color1: string, color2: string, label: string) => {
      const size = Math.max(28, Math.min(60, 20 + mass * 8));
      const bx = x - size / 2;
      const by = groundY - size;

      const grad = ctx.createLinearGradient(bx, by, bx + size, by + size);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(bx, by, size, size, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.font = `bold ${size > 40 ? 11 : 9}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(label, x, by + size / 2 + 4);

      // Velocity arrow
      const arrowLen = Math.min(Math.abs(vel) * 12, 60);
      if (arrowLen > 3) {
        const dir = vel > 0 ? 1 : -1;
        const startX = vel > 0 ? bx + size + 3 : bx - 3;
        const endX = startX + dir * arrowLen;
        ctx.beginPath();
        ctx.strokeStyle = vel > 0 ? '#34d399' : '#f87171';
        ctx.lineWidth = 2.5;
        ctx.moveTo(startX, groundY - size / 2);
        ctx.lineTo(endX, groundY - size / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = vel > 0 ? '#34d399' : '#f87171';
        ctx.moveTo(endX, groundY - size / 2);
        ctx.lineTo(endX - dir * 8, groundY - size / 2 - 5);
        ctx.lineTo(endX - dir * 8, groundY - size / 2 + 5);
        ctx.fill();
      }

      ctx.textAlign = 'left';
      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${vel.toFixed(1)} m/s`, x, groundY - size - 5);
      ctx.textAlign = 'left';
    };

    drawBlock(s.xA, s.mA, s.vA, '#3b82f6', '#1d4ed8', `A ${s.mA}kg`);

    if (type === 'inelastic' && s.collided) {
      drawBlock((s.xA + s.xB) / 2, s.mA + s.mB, s.vA, '#8b5cf6', '#6d28d9', `A+B`);
    } else {
      drawBlock(s.xB, s.mB, s.vB, '#f59e0b', '#d97706', `B ${s.mB}kg`);
    }
  }, [type]);

  const reset = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    runningRef.current = false;
    setIsRunning(false);
    stateRef.current = initState();
    setResults(null);
    draw(stateRef.current);
  }, [initState, draw]);

  useEffect(() => { reset(); }, [mA, mB, vAInit, vBInit, type, reset]);

  const step = useCallback((timestamp: number) => {
    if (!runningRef.current) return;
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;

    const s = stateRef.current!;
    if (s.collided) { draw(s); animRef.current = requestAnimationFrame(step); return; }

    let { xA, xB, vA, vB } = s;
    xA += vA * dt * 60;
    xB += vB * dt * 60;

    const sizeA = Math.max(28, Math.min(60, 20 + mA * 8)) / 2;
    const sizeB = Math.max(28, Math.min(60, 20 + mB * 8)) / 2;

    if (xA + sizeA >= xB - sizeB && !s.collided) {
      let newVA: number, newVB: number;
      if (type === 'elastic') {
        const { v1f, v2f } = computeElastic(mA, vA, mB, vB);
        newVA = v1f; newVB = v2f;
      } else {
        const { vf } = computeInelastic(mA, vA, mB, vB);
        newVA = vf; newVB = vf;
      }

      const pBefore = mA * vA + mB * vB;
      const pAfter = type === 'elastic' ? mA * newVA + mB * newVB : (mA + mB) * newVA;
      const keBefore = 0.5 * mA * vA * vA + 0.5 * mB * vB * vB;
      const keAfter = type === 'elastic'
        ? 0.5 * mA * newVA * newVA + 0.5 * mB * newVB * newVB
        : 0.5 * (mA + mB) * newVA * newVA;

      setResults({ pBefore, pAfter, keBefore, keAfter, vAfterA: newVA, vAfterB: newVB });
      stateRef.current = { ...s, xA, xB, vA: newVA, vB: newVB, collided: true, phase: 'after' };
    } else {
      // Bounce off walls
      if (xA < 30) { xA = 30; vA = Math.abs(vA); }
      if (xB > 570) { xB = 570; vB = -Math.abs(vB); }
      stateRef.current = { ...s, xA, xB, vA, vB };
    }

    draw(stateRef.current!);
    animRef.current = requestAnimationFrame(step);
  }, [mA, mB, type, draw]);

  const start = useCallback(() => {
    runningRef.current = true;
    setIsRunning(true);
    lastTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(step);
  }, [step]);

  const pause = () => { cancelAnimationFrame(animRef.current); runningRef.current = false; setIsRunning(false); };

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const chartData = results ? [
    { name: 'Antes', momento: +results.pBefore.toFixed(3), energia: +results.keBefore.toFixed(3) },
    { name: 'Depois', momento: +results.pAfter.toFixed(3), energia: +results.keAfter.toFixed(3) },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
        <canvas ref={canvasRef} width={600} height={200} className="w-full" aria-label="Simulação de colisão" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          <Button variant={isRunning ? 'secondary' : 'primary'} size="sm"
            icon={isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            onClick={isRunning ? pause : start}>
            {isRunning ? 'Pausar' : 'Iniciar'}
          </Button>
          <Button variant="outline" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={reset}>Reset</Button>
        </div>
      </div>

      {/* Collision type */}
      <div className="flex gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
        {['elastic', 'inelastic'].map((t) => (
          <button key={t}
            onClick={() => setType(t as 'elastic' | 'inelastic')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${type === t
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}>
            {t === 'elastic' ? 'Elástica' : 'Perfeitamente Inelástica'}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 grid sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase">Carrinho A (azul)</p>
          <Slider label="Massa A" value={mA} min={0.5} max={10} step={0.5} unit="kg" onChange={setMA} />
          <Slider label="Velocidade A" value={vAInit} min={-10} max={10} step={0.5} unit="m/s" onChange={setVAInit} />
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase">Carrinho B (amarelo)</p>
          <Slider label="Massa B" value={mB} min={0.5} max={10} step={0.5} unit="kg" onChange={setMB} />
          <Slider label="Velocidade B" value={vBInit} min={-10} max={10} step={0.5} unit="m/s" onChange={setVBInit} />
        </div>
      </div>

      {results && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Resultados da Colisão</p>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Vel. A após', value: results.vAfterA.toFixed(3), unit: 'm/s', color: 'text-blue-600 dark:text-blue-400' },
                { label: 'Vel. B após', value: results.vAfterB.toFixed(3), unit: 'm/s', color: 'text-amber-600 dark:text-amber-400' },
                { label: 'Momento antes', value: results.pBefore.toFixed(3), unit: 'kg·m/s', color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Momento depois', value: results.pAfter.toFixed(3), unit: 'kg·m/s', color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Ec antes', value: results.keBefore.toFixed(3), unit: 'J', color: 'text-purple-600 dark:text-purple-400' },
                { label: 'Ec depois', value: results.keAfter.toFixed(3), unit: 'J', color: 'text-purple-600 dark:text-purple-400' },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span className="text-slate-600 dark:text-slate-400 text-xs">{r.label}</span>
                  <span className={`font-mono font-bold text-xs ${r.color}`}>{r.value} {r.unit}</span>
                </div>
              ))}
            </div>
          </div>
          {chartData.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Comparação Antes/Depois</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="momento" name="Momento (kg·m/s)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="energia" name="Ec (J)" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
