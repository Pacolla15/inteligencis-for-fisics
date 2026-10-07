import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Slider } from '../common/Slider';
import { Button } from '../common/Button';

export const InclinedPlaneSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const runningRef = useRef(false);
  const lastTimeRef = useRef(0);
  const posRef = useRef(0); // position along the incline
  const velRef = useRef(0);

  const [mass, setMass] = useState(5);
  const [angle, setAngle] = useState(30);
  const [mu, setMu] = useState(0.2);
  const g = 9.81;

  const [isRunning, setIsRunning] = useState(false);
  const [showVectors, setShowVectors] = useState(true);
  const [simStatus, setSimStatus] = useState<'parado' | 'deslizando' | 'acelerando'>('parado');

  const rad = (angle * Math.PI) / 180;
  const N = mass * g * Math.cos(rad);
  const Fatrit = mu * N;
  const Fpar = mass * g * Math.sin(rad);
  const Fres = Fpar - Fatrit;
  const accel = Fres / mass; // positive = down the slope

  const draw = useCallback((pos: number, vel: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const isDark = document.documentElement.classList.contains('dark');

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    const baseX = 40, baseY = H - 40;
    const rampL = W - 80;
    const rampH = rampL * Math.tan(rad);
    const clampedH = Math.min(rampH, H - 60);
    const effectiveL = clampedH / Math.tan(rad);
    const topX = baseX;
    const topY = baseY - clampedH;

    // Ramp fill
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(topX, topY);
    ctx.lineTo(baseX + effectiveL, baseY);
    ctx.closePath();
    ctx.fillStyle = isDark ? 'rgba(100,116,139,0.2)' : 'rgba(148,163,184,0.2)';
    ctx.fill();
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Angle arc
    ctx.beginPath();
    ctx.arc(baseX + effectiveL, baseY, 30, Math.PI, Math.PI + rad, true);
    ctx.strokeStyle = isDark ? '#f59e0b' : '#d97706';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = isDark ? '#f59e0b' : '#d97706';
    ctx.font = '11px monospace';
    ctx.fillText(`${angle}°`, baseX + effectiveL - 44, baseY - 8);

    // Block position along slope
    const maxPos = effectiveL - 30;
    const clampedPos = Math.max(0, Math.min(maxPos, pos));
    const distFromTop = maxPos - clampedPos;
    const bx = topX + distFromTop * Math.cos(rad);
    const by = topY + distFromTop * Math.sin(rad);

    // Draw block
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-rad);
    const bSize = 28;
    const blkGrad = ctx.createLinearGradient(-bSize / 2, -bSize, bSize / 2, 0);
    blkGrad.addColorStop(0, '#3b82f6');
    blkGrad.addColorStop(1, '#1e40af');
    ctx.fillStyle = blkGrad;
    ctx.beginPath();
    ctx.roundRect(-bSize / 2, -bSize, bSize, bSize, 4);
    ctx.fill();
    ctx.strokeStyle = '#bfdbfe';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass}kg`, 0, -bSize / 2 + 3);
    ctx.restore();

    // Vectors
    if (showVectors) {
      const midX = bx;
      const midY = by - 14;
      const fScale = 2;

      const drawVec = (fx: number, fy: number, tx: number, ty: number, color: string, lbl: string) => {
        if (Math.sqrt((tx - fx) ** 2 + (ty - fy) ** 2) < 3) return;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        const a = Math.atan2(ty - fy, tx - fx);
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - 8 * Math.cos(a - 0.4), ty - 8 * Math.sin(a - 0.4));
        ctx.lineTo(tx - 8 * Math.cos(a + 0.4), ty - 8 * Math.sin(a + 0.4));
        ctx.fill();
        ctx.fillStyle = color;
        ctx.font = 'bold 10px monospace';
        ctx.fillText(lbl, tx + 4, ty);
      };

      // Weight (down)
      drawVec(midX, midY, midX, midY + mass * g * 0.25 * fScale, '#ef4444', 'P');
      // Normal (perp to slope)
      drawVec(midX, midY, midX - N * 0.12 * fScale * Math.sin(rad), midY - N * 0.12 * fScale * Math.cos(rad), '#a855f7', 'N');
      // Friction (up the slope)
      if (Fatrit > 0 && isRunning) {
        drawVec(midX, midY, midX - Fatrit * 0.12 * fScale * Math.cos(rad), midY + Fatrit * 0.12 * fScale * Math.sin(rad), '#f59e0b', 'Fat');
      }
    }

    // Info
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`N = ${N.toFixed(2)} N`, 8, 15);
    ctx.fillText(`Fat = ${Fatrit.toFixed(2)} N`, 8, 28);
    ctx.fillText(`Fres = ${Fres.toFixed(2)} N`, 8, 41);
    ctx.fillText(`a = ${accel.toFixed(3)} m/s²`, 8, 54);
  }, [angle, mass, mu, N, Fatrit, Fpar, Fres, accel, rad, showVectors, isRunning]);

  const reset = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    runningRef.current = false;
    posRef.current = 0;
    velRef.current = 0;
    setIsRunning(false);
    setSimStatus(Fres > 0 ? 'deslizando' : 'parado');
    draw(0, 0);
  }, [draw, Fres]);

  useEffect(() => { reset(); }, [angle, mass, mu, reset]);
  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const step = useCallback((timestamp: number) => {
    if (!runningRef.current) return;
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;

    if (accel > 0) {
      velRef.current += accel * dt;
      posRef.current += velRef.current * dt * 40;
      setSimStatus('acelerando');
    } else if (velRef.current > 0) {
      velRef.current += accel * dt;
      if (velRef.current < 0) velRef.current = 0;
      posRef.current += velRef.current * dt * 40;
    } else {
      setSimStatus('parado');
    }

    const canvas = canvasRef.current;
    const maxPos = canvas ? canvas.width - 120 : 200;
    if (posRef.current > maxPos) {
      posRef.current = maxPos;
      velRef.current = 0;
    }

    draw(posRef.current, velRef.current);
    animRef.current = requestAnimationFrame(step);
  }, [accel, draw]);

  const start = useCallback(() => {
    if (Fres <= 0) { setSimStatus('parado'); return; }
    runningRef.current = true;
    setIsRunning(true);
    setSimStatus('acelerando');
    lastTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(step);
  }, [Fres, step]);

  const pause = () => {
    cancelAnimationFrame(animRef.current);
    runningRef.current = false;
    setIsRunning(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
        <canvas ref={canvasRef} width={560} height={280} className="w-full" aria-label="Simulação de plano inclinado" />
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

      {/* Status pill */}
      <div className={`text-xs font-semibold px-3 py-2 rounded-lg border ${
        Fres > 0
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
      }`}>
        {Fres > 0
          ? `Bloco DESLIZA — a = ${accel.toFixed(3)} m/s² | mg·sin(θ) = ${Fpar.toFixed(2)} N > Fat = ${Fatrit.toFixed(2)} N`
          : `Bloco EM REPOUSO — atrito suficiente para sustentar: mg·sin(θ) = ${Fpar.toFixed(2)} N ≤ Fat_max = ${Fatrit.toFixed(2)} N`
        }
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Slider label="Massa (m)" value={mass} min={0.5} max={20} step={0.5} unit="kg" onChange={setMass} />
          <Slider label="Ângulo (θ)" value={angle} min={1} max={80} step={1} unit="°" onChange={setAngle} />
          <Slider label="Coef. Atrito (μ)" value={mu} min={0} max={1} step={0.02} unit="" onChange={setMu} />
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            { label: 'Normal N', value: N.toFixed(2), unit: 'N', color: 'text-purple-500' },
            { label: 'Atrito Fat', value: Fatrit.toFixed(2), unit: 'N', color: 'text-amber-500' },
            { label: 'Fres', value: Fres.toFixed(2), unit: 'N', color: 'text-blue-500' },
            { label: 'Aceleração a', value: Math.max(0, accel).toFixed(3), unit: 'm/s²', color: 'text-emerald-500' },
          ].map(s => (
            <div key={s.label} className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
              <p className="text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
              <p className={`font-bold font-mono ${s.color}`}>{s.value} {s.unit}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
