import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Eye, EyeOff, Info } from 'lucide-react';
import { Slider } from '../common/Slider';
import { Button } from '../common/Button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

interface BlockState { x: number; v: number; t: number; }
interface DataPoint { t: number; v: number; x: number; F: number; }

export const NewtonLawSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const runningRef = useRef(false);
  const stateRef = useRef<BlockState>({ x: 80, v: 0, t: 0 });
  const lastTimeRef = useRef(0);

  const [mass, setMass] = useState(5);
  const [force, setForce] = useState(20);
  const [mu, setMu] = useState(0.2);
  const [isRunning, setIsRunning] = useState(false);
  const [showVectors, setShowVectors] = useState(true);
  const [data, setData] = useState<DataPoint[]>([]);

  const g = 9.81;
  const N = mass * g;
  const Fatrit = mu * N;
  const Fres = Math.abs(force) > Fatrit ? force - Math.sign(force) * Fatrit : 0;
  const accel = Fres / mass;

  const draw = useCallback((s: BlockState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const isDark = document.documentElement.classList.contains('dark');

    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    const groundY = H - 50;

    // Ground
    ctx.fillStyle = isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.1)';
    ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = isDark ? '#059669' : '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();

    // Grid lines
    ctx.strokeStyle = isDark ? 'rgba(51,65,85,0.3)' : 'rgba(226,232,240,0.6)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, groundY); ctx.stroke();
    }

    // Block
    const bSize = Math.max(30, Math.min(60, 18 + mass * 4));
    const bx = Math.max(10, Math.min(W - bSize - 10, s.x));
    const by = groundY - bSize;

    const blockGrad = ctx.createLinearGradient(bx, by, bx + bSize, by + bSize);
    blockGrad.addColorStop(0, '#3b82f6');
    blockGrad.addColorStop(1, '#1e40af');
    ctx.fillStyle = blockGrad;
    ctx.beginPath();
    ctx.roundRect(bx, by, bSize, bSize, 6);
    ctx.fill();
    ctx.strokeStyle = '#bfdbfe';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = `bold ${bSize > 40 ? 11 : 9}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`${mass}kg`, bx + bSize / 2, by + bSize / 2 + 4);
    ctx.textAlign = 'left';

    if (showVectors) {
      const blockCX = bx + bSize / 2;
      const blockCY = by + bSize / 2;

      const drawVec = (x1: number, y1: number, x2: number, y2: number, color: string, lbl: string) => {
        if (Math.abs(x2 - x1) < 2 && Math.abs(y2 - y1) < 2) return;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        const ang = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 9 * Math.cos(ang - 0.4), y2 - 9 * Math.sin(ang - 0.4));
        ctx.lineTo(x2 - 9 * Math.cos(ang + 0.4), y2 - 9 * Math.sin(ang + 0.4));
        ctx.fill();
        ctx.fillStyle = color;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(lbl, x2 + (ang > 0 ? 0 : 0), y2 - 8);
        ctx.textAlign = 'left';
      };

      const fScale = 1.5;
      // Applied force →
      drawVec(bx + bSize, blockCY, bx + bSize + force * fScale, blockCY, '#10b981', 'F');
      // Friction ←
      if (Fatrit > 0 && s.v !== 0) {
        drawVec(bx, blockCY, bx - Fatrit * fScale * 0.5, blockCY, '#f59e0b', 'fat');
      }
      // Weight ↓
      drawVec(blockCX, by + bSize, blockCX, by + bSize + Math.min(mass * g * 0.3, 50), '#ef4444', 'P');
      // Normal ↑
      drawVec(blockCX, groundY, blockCX, groundY - Math.min(N * 0.3, 50), '#a855f7', 'N');
    }

    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '10px monospace';
    ctx.fillText(`v = ${s.v.toFixed(2)} m/s`, 10, 15);
    ctx.fillText(`a = ${accel.toFixed(3)} m/s²`, 10, 28);
    ctx.fillText(`x = ${(s.x - 80).toFixed(1)} m`, 10, 41);
  }, [mass, force, Fatrit, N, accel, showVectors]);

  const reset = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    runningRef.current = false;
    setIsRunning(false);
    stateRef.current = { x: 80, v: 0, t: 0 };
    setData([]);
    draw(stateRef.current);
  }, [draw]);

  const step = useCallback((timestamp: number) => {
    if (!runningRef.current) return;
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;

    const s = stateRef.current;
    const canvasW = canvasRef.current?.width || 600;
    const blockSize = Math.max(30, Math.min(60, 18 + mass * 4));

    let newV = s.v + accel * dt;
    let newX = s.x + s.v * dt * 30;

    // If force is below friction, block stays (if v~0)
    if (Math.abs(force) <= Fatrit && Math.abs(newV) < 0.05) newV = 0;

    // Wall bounce
    if (newX >= canvasW - blockSize - 10) { newX = canvasW - blockSize - 10; newV = 0; }
    if (newX <= 10) { newX = 10; newV = 0; }

    stateRef.current = { x: newX, v: newV, t: s.t + dt };

    if (Math.round(stateRef.current.t * 10) % 2 === 0) {
      setData((prev) => [
        ...prev.slice(-200),
        { t: +stateRef.current.t.toFixed(2), v: +newV.toFixed(3), x: +(newX - 80).toFixed(2), F: +Fres.toFixed(2) },
      ]);
    }

    draw(stateRef.current);
    animRef.current = requestAnimationFrame(step);
  }, [mass, accel, force, Fatrit, Fres, draw]);

  const start = useCallback(() => {
    runningRef.current = true;
    setIsRunning(true);
    lastTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(step);
  }, [step]);

  const pause = () => { cancelAnimationFrame(animRef.current); runningRef.current = false; setIsRunning(false); };

  useEffect(() => { reset(); }, [mass, force, mu, reset]);
  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const canMove = Math.abs(force) > Fatrit;

  return (
    <div className="space-y-4">
      <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
        <canvas ref={canvasRef} width={600} height={220} className="w-full" aria-label="Simulação da Segunda Lei de Newton" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          <Button variant={isRunning ? 'secondary' : 'primary'} size="sm"
            icon={isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            onClick={isRunning ? pause : start}>
            {isRunning ? 'Pausar' : 'Iniciar'}
          </Button>
          <Button variant="outline" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={reset}>Reset</Button>
          <Button variant="ghost" size="sm"
            icon={showVectors ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            onClick={() => setShowVectors(v => !v)}>
            Vetores
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-semibold ${canMove
        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
        : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
      }`}>
        <Info className="w-4 h-4 flex-shrink-0" />
        {canMove
          ? `Bloco em movimento! F_res = ${Fres.toFixed(2)} N | a = ${accel.toFixed(3)} m/s²`
          : `Bloco em repouso: Força aplicada (${Math.abs(force).toFixed(1)} N) ≤ Atrito máximo (${Fatrit.toFixed(2)} N)`
        }
      </div>

      {/* Params */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <Slider label="Massa (m)" value={mass} min={0.5} max={20} step={0.5} unit="kg" onChange={setMass} />
          <Slider label="Força Aplicada (F)" value={force} min={-50} max={50} step={1} unit="N" onChange={setForce} />
          <Slider label="Coef. Atrito (μ)" value={mu} min={0} max={1} step={0.05} unit="" onChange={setMu} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { label: 'Peso (P)', value: (mass * g).toFixed(2), unit: 'N', color: 'text-red-500' },
            { label: 'Normal (N)', value: N.toFixed(2), unit: 'N', color: 'text-purple-500' },
            { label: 'Atrito (Fat)', value: Fatrit.toFixed(2), unit: 'N', color: 'text-amber-500' },
          ].map(s => (
            <div key={s.label} className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
              <p className="text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className={`font-bold font-mono ${s.color}`}>{s.value} {s.unit}</p>
            </div>
          ))}
        </div>
      </div>

      {data.length > 2 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Velocidade × Tempo</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="v" name="v (m/s)" stroke="#3b82f6" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="x" name="x (m)" stroke="#10b981" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
