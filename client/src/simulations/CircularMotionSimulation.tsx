import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Slider } from '../common/Slider';
import { Button } from '../common/Button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

interface MCUState {
  angle: number; // radians
  x: number;
  y: number;
  t: number;
}

interface DataPoint { t: number; x: number; y: number; }

export const CircularMotionSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const runningRef = useRef(false);
  const stateRef = useRef<MCUState>({ angle: 0, x: 0, y: 0, t: 0 });
  const lastTimeRef = useRef(0);

  const [radius, setRadius] = useState(80);
  const [velocity, setVelocity] = useState(20);
  const [mass, setMass] = useState(2);
  const [showVectors, setShowVectors] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState<DataPoint[]>([]);

  const omega = velocity / radius; // angular velocity rad/s
  const ac = (velocity * velocity) / radius;
  const Fc = mass * ac;
  const T = (2 * Math.PI * radius) / velocity;
  const f = 1 / T;

  const draw = useCallback((s: MCUState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const isDark = document.documentElement.classList.contains('dark');

    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    const scale = Math.min((W - 80) / 2, (H - 80) / 2) / 120;
    const r = radius * scale;

    // Orbit circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
    ctx.fill();

    // Radius line
    const px = cx + r * Math.cos(s.angle);
    const py = cy - r * Math.sin(s.angle);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Vectors
    if (showVectors) {
      const vFactor = 1.5;
      const sFactor = velocity * vFactor * scale;

      // Velocity vector (tangential, perpendicular to radius)
      const vx = -Math.sin(s.angle) * sFactor;
      const vy = Math.cos(s.angle) * sFactor;
      drawArrow(ctx, px, py, px + vx, py + vy, '#10b981', 'v', 2);

      // Centripetal acceleration vector (toward center)
      const acFactor = 1.2;
      const acLen = ac * acFactor * scale;
      const acx = (cx - px) / r * acLen;
      const acy = (cy - py) / r * acLen;
      drawArrow(ctx, px, py, px + acx, py + acy, '#f59e0b', 'ac', 2);
    }

    // Particle
    const grad = ctx.createRadialGradient(px - 3, py - 3, 1, px, py, 10);
    grad.addColorStop(0, '#60a5fa');
    grad.addColorStop(1, '#1d4ed8');
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#bfdbfe';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Info overlay
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '10px monospace';
    ctx.fillText(`ω = ${omega.toFixed(3)} rad/s`, 10, 18);
    ctx.fillText(`T = ${T.toFixed(3)} s`, 10, 31);
    ctx.fillText(`t = ${s.t.toFixed(2)} s`, 10, 44);
  }, [radius, velocity, mass, showVectors, omega, ac, T]);

  function drawArrow(
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number, x2: number, y2: number,
    color: string, label: string, width: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 10 * Math.cos(angle - 0.4), y2 - 10 * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - 10 * Math.cos(angle + 0.4), y2 - 10 * Math.sin(angle + 0.4));
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = 'bold 10px monospace';
    ctx.fillText(label, x2 + 4, y2 - 4);
  }

  const step = useCallback((timestamp: number) => {
    if (!runningRef.current) return;
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;

    const s = stateRef.current;
    const newAngle = s.angle + omega * dt;
    const newT = s.t + dt;
    stateRef.current = { angle: newAngle, x: radius * Math.cos(newAngle), y: radius * Math.sin(newAngle), t: newT };

    if (Math.round(newT * 10) % 2 === 0) {
      setData((prev) => [
        ...prev.slice(-300),
        { t: +newT.toFixed(2), x: +stateRef.current.x.toFixed(2), y: +stateRef.current.y.toFixed(2) },
      ]);
    }

    draw(stateRef.current);
    animRef.current = requestAnimationFrame(step);
  }, [omega, radius, draw]);

  const reset = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    runningRef.current = false;
    setIsRunning(false);
    stateRef.current = { angle: 0, x: radius, y: 0, t: 0 };
    setData([]);
    draw(stateRef.current);
  }, [radius, draw]);

  const start = useCallback(() => {
    runningRef.current = true;
    setIsRunning(true);
    lastTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(step);
  }, [step]);

  const pause = () => { cancelAnimationFrame(animRef.current); runningRef.current = false; setIsRunning(false); };

  useEffect(() => { reset(); }, [radius, velocity, reset]);
  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 relative">
        <canvas ref={canvasRef} width={500} height={300} className="w-full" aria-label="Simulação de movimento circular" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          <Button variant={isRunning ? 'secondary' : 'primary'} size="sm"
            icon={isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            onClick={isRunning ? pause : start}>
            {isRunning ? 'Pausar' : 'Iniciar'}
          </Button>
          <Button variant="outline" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={reset}>Reset</Button>
          <Button variant="ghost" size="sm" icon={showVectors ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} onClick={() => setShowVectors(v => !v)}>
            Vetores
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'ac', value: ac.toFixed(3), unit: 'm/s²' },
          { label: 'Fc', value: Fc.toFixed(3), unit: 'N' },
          { label: 'T', value: T.toFixed(3), unit: 's' },
          { label: 'f', value: f.toFixed(4), unit: 'Hz' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-center">
            <p className="text-[10px] font-mono text-slate-500">{s.label}</p>
            <p className="text-lg font-bold text-blue-400 tabular-nums">{s.value}</p>
            <p className="text-[10px] text-slate-500">{s.unit}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <Slider label="Raio (r)" value={radius} min={20} max={120} step={5} unit="m" onChange={setRadius} />
          <Slider label="Velocidade (v)" value={velocity} min={1} max={60} step={1} unit="m/s" onChange={setVelocity} />
          <Slider label="Massa (m)" value={mass} min={0.1} max={20} step={0.1} unit="kg" onChange={setMass} />
        </div>
      </div>

      {data.length > 2 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Projeções x(t) e y(t)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: 't (s)', position: 'insideBottom', dy: 10, fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="x" name="x (m)" stroke="#3b82f6" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="y" name="y (m)" stroke="#10b981" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
