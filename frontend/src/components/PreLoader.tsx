import React, { useEffect, useRef, useState } from "react";

type PreLoaderProps = {
  /** Сколько длится загрузка (мс) */
  durationMs?: number;
  /** Коллбек, когда дошло до 100% */
  onComplete?: () => void;
  /** Стартовое значение, если нужно (0..100) */
  initialProgress?: number;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export default function PreLoader({
  durationMs = 3200,
  onComplete,
  initialProgress = 0,
}: PreLoaderProps) {
  const [progress, setProgress] = useState(() => clamp(initialProgress, 0, 100));
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const p = clamp((elapsed / durationMs) * 100, 0, 100);

      setProgress(p);

      if (p >= 100) {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [durationMs, onComplete]);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center">
      {/* Локальные keyframes, без tailwind.config */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes shimmer {
          0% { filter: brightness(1) saturate(1); }
          50% { filter: brightness(1.15) saturate(1.2); }
          100% { filter: brightness(1) saturate(1); }
        }

        .animatedGradientText {
          background-image: linear-gradient(
            90deg,
            rgba(56, 189, 248, 1),
            rgba(167, 139, 250, 1),
            rgba(244, 114, 182, 1),
            rgba(56, 189, 248, 1)
          );
          background-size: 300% 300%;
          animation: gradientShift 2.4s ease-in-out infinite, shimmer 1.8s ease-in-out infinite;

          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;

          /* аккуратный контур + глубина */
          -webkit-text-stroke: 1px rgba(255,255,255,0.16);
          text-shadow: 0 12px 40px rgba(0,0,0,0.55);
        }
      `}</style>

      <div className="w-full max-w-3xl px-6">
        <div className="flex flex-col items-center gap-3 select-none">
          <div className="animatedGradientText font-extrabold tracking-tight text-6xl sm:text-7xl md:text-8xl leading-none">
            WAI
          </div>
          <div className="animatedGradientText font-extrabold tracking-tight text-5xl sm:text-6xl md:text-7xl leading-none">
            HR AI
          </div>
          <div className="animatedGradientText font-extrabold tracking-tight text-5xl sm:text-6xl md:text-7xl leading-none">
            NAVIGATE
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 w-full">
            <div className="w-full max-w-md h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-400"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-white/80 font-semibold tabular-nums">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}