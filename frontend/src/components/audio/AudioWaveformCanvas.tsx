import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface AudioWaveformCanvasProps {
  isMonitoring?: boolean;
  showEnhanced?: boolean;
  className?: string;
  height?: number;
}

export function AudioWaveformCanvas({
  isMonitoring = true,
  showEnhanced = true,
  className,
  height = 180,
}: AudioWaveformCanvasProps): React.ReactElement {
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

      const horizontalLines = 4;
      for (let i = 1; i < horizontalLines; i++) {
        const y = (height / horizontalLines) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }

      const verticalLines = 8;
      for (let i = 1; i < verticalLines; i++) {
        const x = (width / verticalLines) * i;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      ctx.stroke();

      // Center Line
      const centerY = height / 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      if (isMonitoring) {
        phaseRef.current += 0.05;
        const phase = phaseRef.current;

        // Raw Audio Waveform (#2F80ED Accent Blue)
        ctx.strokeStyle = '#2F80ED';
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        const samples = 256;
        const sliceWidth = width / samples;

        for (let i = 0; i < samples; i++) {
          const x = i * sliceWidth;
          const t = (i / samples) * Math.PI * 4 + phase;

          const yOffset =
            Math.sin(t) * 25 +
            Math.sin(t * 2.3 + phase) * 15 +
            Math.sin(t * 5.1) * 8 +
            (Math.random() - 0.5) * 4;

          const y = centerY + yOffset;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Enhanced Signal Waveform (#16A34A Accent Green)
        if (showEnhanced) {
          ctx.strokeStyle = '#16A34A';
          ctx.lineWidth = 2;
          ctx.beginPath();

          for (let i = 0; i < samples; i++) {
            const x = i * sliceWidth;
            const t = (i / samples) * Math.PI * 4 + phase;

            const yOffset = Math.sin(t) * 30 + Math.sin(t * 2.3 + phase) * 18;
            const y = centerY + yOffset;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
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
  }, [isMonitoring, showEnhanced, height]);

  return (
    <div className={cn('w-full relative overflow-hidden rounded-2xl border border-white/6 bg-[#07111F]', className)}>
      <canvas ref={canvasRef} className="w-full block" />

      {/* Overlay Legend */}
      <div className="absolute top-3 right-4 flex items-center gap-4 bg-[#132238]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/6 text-xs font-mono select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-1 bg-[#2F80ED] rounded-full" />
          <span className="text-[#94A3B8]">Input Signal</span>
        </div>
        {showEnhanced && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-1 bg-[#16A34A] rounded-full" />
            <span className="text-[#94A3B8]">AI Enhanced</span>
          </div>
        )}
      </div>
    </div>
  );
}
