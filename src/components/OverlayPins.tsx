'use client';

import { useState } from 'react';
import { POI } from '@/lib/api';

interface OverlayPinsProps {
  pois: POI[];
  onPoiTap?: (poi: POI) => void;
}

export default function OverlayPins({ pois, onPoiTap }: OverlayPinsProps) {
  const [activePoi, setActivePoi] = useState<string | null>(null);

  const handlePoiTap = (poi: POI) => {
    setActivePoi(activePoi === poi.id ? null : poi.id);
    onPoiTap?.(poi);
  };

  return (
    <div className="overlay-container">
      {pois.map((poi) => {
        const isActive = activePoi === poi.id;
        
        return (
          <div
            key={poi.id}
            className={`poi-pin ${isActive ? 'active' : ''}`}
            style={{
              left: `${poi.screen_anchor.x * 100}%`,
              top: `${poi.screen_anchor.y * 100}%`,
            }}
            onClick={() => handlePoiTap(poi)}
          >
            {/* Pulse animation ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-emerald-500/30 animate-ping" />
            </div>
            
            {/* Label tooltip */}
            <div
              className={`
                absolute left-1/2 -translate-x-1/2 whitespace-nowrap
                transition-all duration-200 pointer-events-none
                ${isActive ? 'bottom-8 opacity-100' : 'bottom-6 opacity-0'}
              `}
            >
              <div className="glass px-3 py-2 rounded-lg text-center max-w-[200px]">
                <p className="text-sm font-medium text-white">{poi.label}</p>
                {isActive && (
                  <p className="text-xs text-white/70 mt-1 whitespace-normal">
                    {poi.why_it_matters}
                  </p>
                )}
                {/* Confidence indicator */}
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="h-1 w-12 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${poi.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/50">
                    {Math.round(poi.confidence * 100)}%
                  </span>
                </div>
              </div>
              {/* Arrow pointing down */}
              <div className="w-2 h-2 bg-black/50 rotate-45 mx-auto -mt-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
