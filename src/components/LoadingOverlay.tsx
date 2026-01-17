'use client';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export default function LoadingOverlay({ isVisible, message = 'Analyzing scene...' }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-2xl px-8 py-6 flex flex-col items-center gap-4">
        {/* Animated rings */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-emerald-400/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-t-emerald-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          <div className="absolute inset-4 border-4 border-transparent border-t-emerald-200 rounded-full animate-spin" style={{ animationDuration: '0.6s' }}></div>
        </div>
        
        {/* Pulsing text */}
        <p className="text-white text-lg font-medium animate-pulse">{message}</p>
        
        {/* Animated dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
}
