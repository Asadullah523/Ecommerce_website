import React from 'react';

export default function SalesChart({ 
  data = [0, 0, 0, 0, 0, 0, 0], 
  labels = [] 
}) {
  const height = 180;
  const width = 800;
  const padding = 40;
  
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Generate path points
  const points = data.map((val, i) => {
    const x = data.length > 1 
      ? (i / (data.length - 1)) * (width - padding * 2) + padding 
      : width / 2;
    const y = height - ((val - min) / range) * (height - padding * 2) - padding;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0, 255, 255, 0.4)" />
            <stop offset="100%" stopColor="rgba(0, 255, 255, 0)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background Grid Lines (Horizontal) */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line 
            key={i} 
            x1={padding} 
            y1={padding + (height - padding * 2) * p} 
            x2={width - padding} 
            y2={padding + (height - padding * 2) * p} 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="1"
          />
        ))}

        {/* The Area */}
        <path d={areaPath} fill="url(#chartGradient)" />
        
        {/* The Line */}
        <path 
          d={linePath} 
          fill="none" 
          stroke="cyan" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* Data Points */}
        {points.map((p, i) => (
          <circle 
            key={i} 
            cx={p.x} 
            cy={p.y} 
            r="4" 
            fill="black" 
            stroke="cyan" 
            strokeWidth="2" 
            className="hover:r-6 transition-all cursor-pointer"
          />
        ))}
      </svg>
    </div>
  );
}
