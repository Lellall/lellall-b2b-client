import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface BottleSliderProps {
  initialPercentage: number; // 0 to 100
  onPour: (newPercentage: number) => void;
  brandName: string;
  bottleName: string;
}

const BottleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #E5E7EB;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
`;

const BottleTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #05431E;
  margin-bottom: 4px;
  text-align: center;
`;

const BrandSubtitle = styled.p`
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 24px;
  text-align: center;
`;

const SvgWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 300px;
  cursor: ns-resize;
  user-select: none;
`;

const LevelIndicator = styled.div<{ $percentage: number }>`
  position: absolute;
  right: -45px;
  bottom: ${(props) => Math.max(10, Math.min(props.$percentage, 90))}%;
  transform: translateY(50%);
  background: #05431E;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  pointer-events: none;
  transition: bottom 0.1s ease-out;

  &::before {
    content: '';
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 4px 4px 4px 0;
    border-style: solid;
    border-color: transparent #05431E transparent transparent;
  }
`;

const BottleSlider: React.FC<BottleSliderProps> = ({ initialPercentage, onPour, brandName, bottleName }) => {
  const [percentage, setPercentage] = useState(initialPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<HTMLDivElement>(null);

  const calculatePercentage = (clientY: number) => {
    if (!svgRef.current) return percentage;
    const rect = svgRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const height = rect.height;
    
    // Invert Y because 0 is at the top of the SVG, but 100% is full
    let p = 100 - ((y / height) * 100);
    p = Math.max(0, Math.min(p, initialPercentage)); // Prevent filling above initial
    return Math.round(p);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setPercentage(calculatePercentage(e.clientY));
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setPercentage(calculatePercentage(e.clientY));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      if (percentage < initialPercentage) {
        onPour(percentage);
      }
    }
  };

  useEffect(() => {
    if (percentage > initialPercentage) {
      setPercentage(initialPercentage);
    }
  }, [initialPercentage]);

  return (
    <BottleContainer>
      <BottleTitle>{bottleName}</BottleTitle>
      <BrandSubtitle>{brandName}</BrandSubtitle>

      <SvgWrapper
        ref={svgRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <svg viewBox="0 0 100 300" width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <clipPath id="liquidClip">
              <rect x="0" y={`${100 - percentage}%`} width="100" height={`${percentage}%`} />
            </clipPath>
            <linearGradient id="liquidGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C9A84C" />
              <stop offset="50%" stopColor="#E6CD73" />
              <stop offset="100%" stopColor="#B3913B" />
            </linearGradient>
            <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="20%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
          </defs>

          {/* Bottle Back Outline / Shadow */}
          <path
            d="M 35 10 C 35 5, 40 5, 40 5 L 60 5 C 60 5, 65 5, 65 10 L 65 60 C 65 80, 85 100, 85 120 L 85 280 C 85 295, 75 295, 50 295 C 25 295, 15 295, 15 280 L 15 120 C 15 100, 35 80, 35 60 Z"
            fill="#F3F4F6"
            stroke="#D1D5DB"
            strokeWidth="2"
          />

          {/* Liquid Fill */}
          <g clipPath="url(#liquidClip)">
            <path
              d="M 35 10 C 35 5, 40 5, 40 5 L 60 5 C 60 5, 65 5, 65 10 L 65 60 C 65 80, 85 100, 85 120 L 85 280 C 85 295, 75 295, 50 295 C 25 295, 15 295, 15 280 L 15 120 C 15 100, 35 80, 35 60 Z"
              fill="url(#liquidGrad)"
            />
          </g>

          {/* Liquid Top Surface (Ellipse) */}
          {percentage > 0 && percentage < 100 && (
            <ellipse
              cx="50"
              cy={`${100 - percentage}%`}
              rx={percentage > 80 ? "15" : percentage > 60 ? "25" : "35"} 
              ry="4"
              fill="#E6CD73"
              opacity="0.8"
            />
          )}

          {/* Glass Highlights */}
          <path
            d="M 35 10 C 35 5, 40 5, 40 5 L 60 5 C 60 5, 65 5, 65 10 L 65 60 C 65 80, 85 100, 85 120 L 85 280 C 85 295, 75 295, 50 295 C 25 295, 15 295, 15 280 L 15 120 C 15 100, 35 80, 35 60 Z"
            fill="url(#glassGrad)"
            pointerEvents="none"
          />

          {/* Label outline placeholder */}
          <rect x="25" y="160" width="50" height="60" fill="white" opacity="0.9" rx="4" />
          <text x="50" y="190" textAnchor="middle" fontSize="8" fill="#05431E" fontWeight="bold">SANCTUM</text>
          <text x="50" y="205" textAnchor="middle" fontSize="6" fill="#6B7280">PRIVATE RESERVE</text>

        </svg>

        <LevelIndicator $percentage={percentage}>
          {percentage}%
        </LevelIndicator>
      </SvgWrapper>
      
      <p className="text-sm text-gray-500 mt-6 text-center">
        Drag down to log a pour. Current level: {percentage}%.
      </p>
    </BottleContainer>
  );
};

export default BottleSlider;
