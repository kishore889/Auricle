import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface SpectrumCanvasProps {
  isMonitoring?: boolean;
  barCount?: number;
  height?: number;
  className?: string;
}

export function SpectrumCanvas({
  isMonitoring = true,
  barCount = 32,
  height = 180,
  className,
}: SpectrumCanvasProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth ?? 600);
    canvas.height = height;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    const renderFrame = () => {
      if (!ctx || !canvas) return;

      // Clear Canvas (#07111F)
      ctx.fillStyle = '#07111F';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 1; i < 4; i++) {
        const y = (height / 4) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      if (isMonitoring) {
        phaseRef.current += 0.04;
        const phase = phaseRef.current;

        const gap = 4;
        const totalGap = gap * (barCount - 1);
        const barWidth = Math.max(2, (width - totalGap) / barCount);

        for (let i = 0; i < barCount; i++) {
          const x = i * (barWidth + gap);

          const freqNorm = i / barCount;
          const envelope = Math.sin(freqNorm * Math.PI) * 0.8 + 0.15;
          const noise = (Math.sin(i * 1.7 + phase * 2) + 1) * 0.25;

          const barHeightNorm = Math.min(1, Math.max(0.05, envelope * (0.6 + noise)));
          const barHeight = barHeightNorm * (height - 30);
          const y = height - barHeight;

          // Gradient color from Accent Blue (#2F80ED) to Accent Green (#16A34A)
          const gradient = ctx.createLinearGradient(0, height, 0, y);
          gradient.addColorStop(0, '#2F80ED');
          gradient.addColorStop(1, '#16A34A');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isMonitoring, barCount, height]);

  return (
    <div className={cn('w-full relative overflow-hidden rounded-2xl border border-white/6 bg-[#07111F]', className)}>
      <canvas ref={canvasRef} className="w-full block" />

      {/* Frequency Labels */}
      <div className="absolute bottom-1.5 left-0 right-0 px-4 flex justify-between text-[10px] font-mono text-[#94A3B8]/60 select-none">
        <span>100 Hz</span>
        <span>500 Hz</span>
        <span>1 kHz</span>
        <span>2 kHz</span>
        <span>4 kHz</span>
        <span>8 kHz</span>
      </div>
    </div>
  );
}
