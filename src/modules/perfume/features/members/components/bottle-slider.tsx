import React, { useState, useRef, useEffect } from 'react';
import { Wine } from 'lucide-react';

interface BottleSliderProps {
  totalVolumeMl: number;
  remainingVolumeMl: number;
  pourAmount: number;
  onChange: (pourAmount: number) => void;
  colorHex?: string;
}

export const BottleSlider: React.FC<BottleSliderProps> = ({
  totalVolumeMl,
  remainingVolumeMl,
  pourAmount,
  onChange,
  colorHex = '#05431E', // Default deep green/black
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // The liquid level we will end up with after pouring
  const newLevelMl = Math.max(0, remainingVolumeMl - pourAmount);

  // Calculate percentages (0 to 100)
  // Liquid total (before pour)
  const remainingPct = (remainingVolumeMl / totalVolumeMl) * 100;
  // Liquid left (after pour)
  const newLevelPct = (newLevelMl / totalVolumeMl) * 100;

  // We map percentage to an SVG coordinate.
  // SVG viewBox is 0 0 100 300
  // Y goes from 0 (top) to 300 (bottom).
  // So 100% full = Y is near 10 (top of liquid).
  // 0% full = Y is 290 (bottom of liquid).
  const pctToY = (pct: number) => 290 - (pct / 100) * 280;

  const currentY = pctToY(remainingPct);
  const newY = pctToY(newLevelPct);

  // Handle Dragging
  const handlePointerMove = (e: React.PointerEvent | PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    // Calculate Y position relative to the SVG container (0 to rect.height)
    let y = e.clientY - rect.top;
    
    // Clamp Y to the container boundaries
    y = Math.max(0, Math.min(y, rect.height));

    // Convert pixel Y back to percentage (0% at bottom, 100% at top)
    const pct = 100 - (y / rect.height) * 100;
    
    // Convert percentage to ML
    let draggedLevelMl = (pct / 100) * totalVolumeMl;
    
    // Clamp the dragged level between 0 and the current remaining volume
    // (You can't pour MORE than what's remaining, and you can't have negative volume)
    draggedLevelMl = Math.max(0, Math.min(draggedLevelMl, remainingVolumeMl));

    // Calculate how much is being poured based on the new level
    const newPourAmount = remainingVolumeMl - draggedLevelMl;
    
    onChange(Math.round(newPourAmount));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    } else {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    // Explicitly call move once to snap to the clicked position
    handlePointerMove(e);
  };

  return (
    <div className="flex flex-col items-center justify-center select-none py-6">
      <div className="text-center mb-6">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Slide to Pour</p>
        <h3 className="text-4xl font-black text-white tabular-nums my-1">
          {pourAmount} <span className="text-lg text-gray-400 font-bold">ml</span>
        </h3>
        <p className="text-xs font-semibold text-amber-500">
          Remaining after: {newLevelMl} ml
        </p>
      </div>

      <div 
        ref={containerRef}
        className="relative w-32 h-80 cursor-ns-resize touch-none drop-shadow-2xl hover:scale-[1.02] transition-transform"
        onPointerDown={handlePointerDown}
      >
        <svg viewBox="0 0 100 300" className="w-full h-full overflow-visible">
          <defs>
            {/* The main shape of the bottle for clipping */}
            <clipPath id="bottleClip">
              <path d="M40 5 L60 5 L60 60 L85 100 L85 285 Q85 295 75 295 L25 295 Q15 295 15 285 L15 100 L40 60 Z" />
            </clipPath>

            {/* Premium liquid gradient */}
            <linearGradient id="liquidGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={colorHex} />
              <stop offset="50%" stopColor={colorHex} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colorHex} />
            </linearGradient>

            {/* Striped pattern for the "pouring" amount */}
            <pattern id="pouringHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#ef4444" strokeWidth="4" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Bottle Background (Empty glass) */}
          <path 
            d="M40 5 L60 5 L60 60 L85 100 L85 285 Q85 295 75 295 L25 295 Q15 295 15 285 L15 100 L40 60 Z" 
            fill="#f9fafb" 
            stroke="#e5e7eb" 
            strokeWidth="2" 
          />

          {/* 1. Base Liquid (What will remain after the pour) */}
          <rect 
            x="0" 
            y={newY} 
            width="100" 
            height={300 - newY} 
            fill="url(#liquidGradient)" 
            clipPath="url(#bottleClip)"
            className="transition-all duration-75"
          />

          {/* 2. Pouring Liquid (The amount being dragged out) */}
          {pourAmount > 0 && (
            <rect 
              x="0" 
              y={currentY} 
              width="100" 
              height={newY - currentY} 
              fill="url(#pouringHatch)" 
              clipPath="url(#bottleClip)"
              className="transition-all duration-75"
            />
          )}

          {/* Liquid Top surface highlight */}
          {remainingPct > 0 && (
            <ellipse 
              cx="50" 
              cy={currentY} 
              rx="40" 
              ry="5" 
              fill="white" 
              opacity="0.3" 
              clipPath="url(#bottleClip)"
              className="transition-all duration-75"
            />
          )}

          {/* Draggable handle line (The indicator the user is grabbing) */}
          {pourAmount > 0 && (
            <g transform={`translate(0, ${newY})`} className="transition-all duration-75">
              <line x1="0" y1="0" x2="100" y2="0" stroke="#ef4444" strokeWidth="3" strokeDasharray="4 2" />
              <circle cx="50" cy="0" r="6" fill="#ef4444" stroke="white" strokeWidth="2" />
            </g>
          )}

          {/* Glass reflection curves (gives it a 3D cylindrical look) */}
          <path 
            d="M22 120 Q28 200 25 280" 
            stroke="white" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
            opacity="0.5" 
          />
          <path 
            d="M80 130 Q75 200 78 260" 
            stroke="white" 
            strokeWidth="1.5" 
            fill="none" 
            strokeLinecap="round" 
            opacity="0.3" 
          />
          
          {/* Bottle Neck / Cork detail */}
          <rect x="38" y="2" width="24" height="15" fill="#374151" rx="2" />
          <rect x="36" y="15" width="28" height="5" fill="#d1d5db" />
        </svg>

        {/* Floating tooltip indicating drag instruction */}
        {!isDragging && pourAmount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pulse">
            <div className="bg-white/90 backdrop-blur text-xs font-bold text-[#05431E] px-3 py-1.5 rounded-full shadow-lg border border-[#05431E]/20 flex items-center gap-1.5">
              Drag down
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
