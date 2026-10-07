import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Sliders, Info } from 'lucide-react';
import { Slider } from '../common/Slider';

const G = 6.6743e-11;

export const GravitationSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const [m1, setM1] = useState(5.972e24);
  const [m2, setM2] = useState(7.342e22);
  const [dist, setDist] = useState(3.844e8);

  const F = (G * m1 * m2) / (dist * dist);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const isDark = document.documentElement.classList.contains('dark');

    ctx.fillStyle = isDark ? '#030712' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // Stars (dark mode)
    if (isDark) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 137 + 41) % W);
        const sy = ((i * 97 + 17) % H);
        ctx.beginPath();
        ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const cx1 = W * 0.28;
    const cx2 = W * 0.72;
    const cy = H / 2;

    // Gravitational force arrows between bodies
    const arrowLen = Math.min(60, 20 + Math.log10(F + 1) * 8);

    // Arrow from body1 toward body2
    ctx.beginPath();
    ctx.moveTo(cx1 + 28, cy);
    ctx.lineTo(cx1 + 28 + arrowLen, cy);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = '#10b981';
    ctx.moveTo(cx1 + 28 + arrowLen, cy);
    ctx.lineTo(cx1 + 28 + arrowLen - 10, cy - 5);
    ctx.lineTo(cx1 + 28 + arrowLen - 10, cy + 5);
    ctx.fill();

    // Arrow from body2 toward body1
    ctx.beginPath();
    ctx.moveTo(cx2 - 28, cy);
    ctx.lineTo(cx2 - 28 - arrowLen, cy);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = '#10b981';
    ctx.moveTo(cx2 - 28 - arrowLen, cy);
    ctx.lineTo(cx2 - 28 - arrowLen + 10, cy - 5);
    ctx.lineTo(cx2 - 28 - arrowLen + 10, cy + 5);
    ctx.fill();

    // Body 1
    const r1 = Math.min(32, Math.max(16, 10 + Math.log10(m1 + 1) * 1.5));
    const g1 = ctx.createRadialGradient(cx1 - 5, cy - 5, 2, cx1, cy, r1);
    g1.addColorStop(0, '#60a5fa');
    g1.addColorStop(1, '#1d4ed8');
    ctx.beginPath();
    ctx.arc(cx1, cy, r1, 0, Math.PI * 2);
    ctx.fillStyle = g1;
    ctx.fill();
    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('M₁', cx1, cy + r1 + 14);
    ctx.fillText(m1.toExponential(2) + ' kg', cx1, cy + r1 + 26);

    // Body 2
    const r2 = Math.min(22, Math.max(10, 6 + Math.log10(m2 + 1) * 1.2));
    const g2 = ctx.createRadialGradient(cx2 - 4, cy - 4, 1, cx2, cy, r2);
    g2.addColorStop(0, '#fcd34d');
    g2.addColorStop(1, '#b45309');
    ctx.beginPath();
    ctx.arc(cx2, cy, r2, 0, Math.PI * 2);
    ctx.fillStyle = g2;
    ctx.fill();
    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    ctx.textAlign = 'center';
    ctx.fillText('M₂', cx2, cy + r2 + 14);
    ctx.fillText(m2.toExponential(2) + ' kg', cx2, cy + r2 + 26);

    // Distance label
    ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx1, cy - 50);
    ctx.lineTo(cx2, cy - 50);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`r = ${dist.toExponential(3)} m`, (cx1 + cx2) / 2, cy - 55);

    // Force label
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`F = ${F.toExponential(4)} N`, W / 2, 18);
    ctx.textAlign = 'left';
  }, [m1, m2, dist, F]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <div className="space-y-4">
      <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
        <canvas ref={canvasRef} width={560} height={260} className="w-full" aria-label="Simulação de gravitação universal" />
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900 text-xs font-semibold text-blue-700 dark:text-blue-300">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>
          F = G·m₁·m₂ / r² = {G.toExponential(4)} · {m1.toExponential(3)} · {m2.toExponential(3)} / {(dist * dist).toExponential(3)} ≈ <strong>{F.toExponential(4)} N</strong>
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Massa M₁</p>
            <Slider label="M₁ (múltiplo de 10²⁴ kg)" value={m1 / 1e24} min={0.1} max={20} step={0.1} unit="× 10²⁴ kg" onChange={(v) => setM1(v * 1e24)} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Massa M₂</p>
            <Slider label="M₂ (múltiplo de 10²² kg)" value={m2 / 1e22} min={0.1} max={100} step={0.5} unit="× 10²² kg" onChange={(v) => setM2(v * 1e22)} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Distância r</p>
            <Slider label="r (múltiplo de 10⁸ m)" value={dist / 1e8} min={0.5} max={10} step={0.1} unit="× 10⁸ m" onChange={(v) => setDist(v * 1e8)} />
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          Tente reduzir a distância à metade: a força aumenta 4 vezes! (lei do inverso do quadrado)
        </div>
      </div>
    </div>
  );
};
