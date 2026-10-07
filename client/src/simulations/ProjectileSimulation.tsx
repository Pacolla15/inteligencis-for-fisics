import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  Play, Pause, RotateCcw, Info, TrendingUp,
  Eye, EyeOff, ChevronRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Slider } from '../common/Slider';
import { Button } from '../common/Button';

interface ProjectileState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  time: number;
  trail: Array<{ x: number; y: number }>;
  landed: boolean;
}

interface GraphPoint {
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  v: number;
}

export const ProjectileSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef<ProjectileState | null>(null);
  const runningRef = useRef(false);
  const lastTimeRef = useRef<number>(0);

  const [params, setParams] = useState({ v0: 30, angle: 45, g: 9.81, h0: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [showVectors, setShowVectors] = useState(true);
  const [graphData, setGraphData] = useState<GraphPoint[]>([]);
  const [stats, setStats] = useState({ x: 0, y: 0, vx: 0, vy: 0, v: 0, t: 0, maxH: 0, range: 0 });
  const [simSpeed, setSimSpeed] = useState(1);
  const [showGraph, setShowGraph] = useState(true);

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const initState = useCallback((): ProjectileState => {
    const rad = toRad(params.angle);
    return {
      x: 0,
      y: params.h0,
      vx: params.v0 * Math.cos(rad),
      vy: params.v0 * Math.sin(rad),
      time: 0,
      trail: [{ x: 0, y: params.h0 }],
      landed: false,
    };
  }, [params]);

  const drawScene = useCallback((ctx: CanvasRenderingContext2D, state: ProjectileState) => {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    const isDark = document.documentElement.classList.contains('dark');

    // Background
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = isDark ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,0.8)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Ground
    const groundY = H - 40;
    ctx.fillStyle = isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)';
    ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = isDark ? '#059669' : '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();

    // Scale: dynamic based on theoretical max range
    const rad = toRad(params.angle);
    const theoreticalRange = (params.v0 * params.v0 * Math.sin(2 * rad)) / params.g;
    const theoreticalMaxH = params.h0 + (params.v0 * params.v0 * Math.sin(rad) * Math.sin(rad)) / (2 * params.g);
    const scaleX = (W - 60) / Math.max(theoreticalRange * 1.1, 1);
    const scaleY = (H - 80) / Math.max(theoreticalMaxH * 1.4 + params.h0, 1);
    const scale = Math.min(scaleX, scaleY, 4);

    const toCanvas = (wx: number, wy: number) => ({
      cx: 30 + wx * scale,
      cy: groundY - wy * scale,
    });

    // Trail
    if (state.trail.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(59,130,246,0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      const f = toCanvas(state.trail[0].x, state.trail[0].y);
      ctx.moveTo(f.cx, f.cy);
      for (const pt of state.trail) {
        const p = toCanvas(pt.x, pt.y);
        ctx.lineTo(p.cx, p.cy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Current position
    const pos = toCanvas(state.x, state.y);
    const r = 10;
    ctx.beginPath();
    ctx.arc(pos.cx, pos.cy, r, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(pos.cx - 3, pos.cy - 3, 1, pos.cx, pos.cy, r);
    grad.addColorStop(0, '#60a5fa');
    grad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#bfdbfe';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Vectors
    if (showVectors && !state.landed) {
      const drawVector = (fromX: number, fromY: number, dvx: number, dvy: number, color: string, label: string) => {
        const mag = Math.sqrt(dvx * dvx + dvy * dvy);
        if (mag < 0.1) return;
        const factor = Math.min(60 / params.v0, 2.5);
        const tx = fromX + dvx * factor;
        const ty = fromY - dvy * factor;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        // Arrowhead
        const angle = Math.atan2(-(ty - fromY), tx - fromX);
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - 10 * Math.cos(angle - 0.4), ty - 10 * Math.sin(angle - 0.4) * -1);
        ctx.lineTo(tx - 10 * Math.cos(angle + 0.4), ty - 10 * Math.sin(angle + 0.4) * -1);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = color;
        ctx.font = 'bold 10px monospace';
        ctx.fillText(label, tx + 4, ty - 4);
      };

      drawVector(pos.cx, pos.cy, state.vx, state.vy, '#10b981', 'v');
      drawVector(pos.cx, pos.cy, 0, -params.g, '#f59e0b', 'g');
    }

    // Axes labels
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '10px monospace';
    ctx.fillText(`x = ${state.x.toFixed(1)} m`, 30, 15);
    ctx.fillText(`y = ${state.y.toFixed(1)} m`, 30, 27);
    ctx.fillText(`t = ${state.time.toFixed(2)} s`, 30, 39);
  }, [params, showVectors]);

  const resetSim = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    runningRef.current = false;
    setIsRunning(false);
    stateRef.current = initState();
    setGraphData([]);
    setStats({ x: 0, y: 0, vx: 0, vy: 0, v: 0, t: 0, maxH: 0, range: 0 });
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawScene(ctx, stateRef.current);
    }
  }, [initState, drawScene]);

  useEffect(() => { resetSim(); }, [params, resetSim]);

  const step = useCallback((timestamp: number) => {
    if (!runningRef.current) return;
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05) * simSpeed;
    lastTimeRef.current = timestamp;

    const s = stateRef.current!;
    const newVy = s.vy - params.g * dt;
    const newX = s.x + s.vx * dt;
    const newY = s.y + s.vy * dt - 0.5 * params.g * dt * dt;
    const newTime = s.time + dt;

    if (newY <= 0 && s.time > 0.01) {
      stateRef.current = { ...s, x: newX, y: 0, vx: s.vx, vy: newVy, time: newTime, landed: true };
    } else {
      const newTrail = [...s.trail.slice(-120), { x: newX, y: Math.max(newY, 0) }];
      stateRef.current = { x: newX, y: Math.max(newY, 0), vx: s.vx, vy: newVy, time: newTime, trail: newTrail, landed: newY <= 0 && s.time > 0.01 };
    }

    const cur = stateRef.current!;
    const speed = Math.sqrt(cur.vx * cur.vx + cur.vy * cur.vy);

    setStats((prev) => ({
      x: cur.x, y: cur.y, vx: cur.vx, vy: cur.vy, v: speed, t: cur.time,
      maxH: Math.max(prev.maxH, cur.y),
      range: cur.landed ? cur.x : prev.range,
    }));

    // Graph data (throttled)
    if (Math.round(newTime * 10) % 2 === 0) {
      setGraphData((prev) => [
        ...prev.slice(-200),
        { t: +newTime.toFixed(2), x: +cur.x.toFixed(2), y: +cur.y.toFixed(2), vx: +cur.vx.toFixed(2), vy: +cur.vy.toFixed(2), v: +speed.toFixed(2) },
      ]);
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawScene(ctx, stateRef.current!);
    }

    if (cur.landed) {
      runningRef.current = false;
      setIsRunning(false);
      return;
    }

    animRef.current = requestAnimationFrame(step);
  }, [params, simSpeed, drawScene]);

  const startSim = useCallback(() => {
    if (!stateRef.current) stateRef.current = initState();
    if (stateRef.current.landed) {
      stateRef.current = initState();
      setGraphData([]);
    }
    runningRef.current = true;
    setIsRunning(true);
    lastTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(step);
  }, [initState, step]);

  const pauseSim = () => {
    cancelAnimationFrame(animRef.current);
    runningRef.current = false;
    setIsRunning(false);
  };

  useEffect(() => {
    return () => { cancelAnimationFrame(animRef.current); };
  }, []);

  // Initial draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx && stateRef.current) drawScene(ctx, stateRef.current);
  }, [drawScene]);

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 aspect-[16/7] shadow-xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={350}
          className="w-full h-full"
          aria-label="Simulação de lançamento de projétil"
        />
        {/* Controls overlay */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <Button
            variant={isRunning ? 'secondary' : 'primary'}
            size="sm"
            icon={isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            onClick={isRunning ? pauseSim : startSim}
          >
            {isRunning ? 'Pausar' : 'Iniciar'}
          </Button>
          <Button variant="outline" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={resetSim}>
            Reset
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={showVectors ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            onClick={() => setShowVectors((v) => !v)}
          >
            Vetores
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: 'x', value: stats.x.toFixed(1), unit: 'm' },
          { label: 'y', value: stats.y.toFixed(1), unit: 'm' },
          { label: 'vx', value: stats.vx.toFixed(2), unit: 'm/s' },
          { label: 'vy', value: stats.vy.toFixed(2), unit: 'm/s' },
          { label: 'Hmax', value: stats.maxH.toFixed(1), unit: 'm' },
          { label: 'Alcance', value: stats.range.toFixed(1), unit: 'm' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-center">
            <p className="text-[10px] font-mono text-slate-500 uppercase">{s.label}</p>
            <p className="text-lg font-bold text-blue-400 tabular-nums">{s.value}</p>
            <p className="text-[10px] text-slate-500">{s.unit}</p>
          </div>
        ))}
      </div>

      {/* Parameters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Parâmetros</h3>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Velocidade da simulação:</label>
            <select
              value={simSpeed}
              onChange={(e) => setSimSpeed(Number(e.target.value))}
              className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1"
            >
              <option value={0.25}>0.25×</option>
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={2}>2×</option>
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Slider label="Velocidade inicial (v₀)" value={params.v0} min={1} max={80} step={1} unit="m/s" onChange={(v) => setParams((p) => ({ ...p, v0: v }))} />
          <Slider label="Ângulo de lançamento (θ)" value={params.angle} min={1} max={89} step={1} unit="°" onChange={(v) => setParams((p) => ({ ...p, angle: v }))} />
          <Slider label="Gravidade (g)" value={params.g} min={1.6} max={24.8} step={0.1} unit="m/s²" onChange={(v) => setParams((p) => ({ ...p, g: v }))} />
          <Slider label="Altura inicial (h₀)" value={params.h0} min={0} max={50} step={1} unit="m" onChange={(v) => setParams((p) => ({ ...p, h0: v }))} />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-2.5 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
          <span>Experimente: altere o ângulo para 45° — isso maximiza o alcance horizontal em terreno plano sem resistência do ar!</span>
        </div>
      </div>

      {/* Graph */}
      {showGraph && graphData.length > 1 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Posição × Tempo</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: 't (s)', position: 'insideBottom', dy: 10, fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="x" name="x (m)" stroke="#3b82f6" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="y" name="y (m)" stroke="#10b981" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 mt-4">Velocidade × Tempo</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: 't (s)', position: 'insideBottom', dy: 10, fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="vx" name="vx (m/s)" stroke="#a855f7" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="vy" name="vy (m/s)" stroke="#f59e0b" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="v" name="|v| (m/s)" stroke="#ef4444" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
