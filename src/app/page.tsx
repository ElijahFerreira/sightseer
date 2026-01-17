'use client';

import { useState, useEffect } from 'react';
import CameraView from '@/components/CameraView';
import { SceneAnalysis } from '@/lib/api';

export default function Home() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SceneAnalysis | null>(null);

  // Check if we're on a secure context (required for camera)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.isSecureContext) {
        setError('Camera requires HTTPS. Please use a secure connection.');
      }
    }
  }, []);

  if (error) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl mb-4">📷</div>
        <h1 className="text-xl font-semibold mb-2">Camera Access Required</h1>
        <p className="text-white/70 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-emerald-500 rounded-full font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-semibold mb-2">Permission Denied</h1>
        <p className="text-white/70 mb-6">
          Sightseer needs camera access to work. Please enable it in your browser settings.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-emerald-500 rounded-full font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="h-dvh">
      <CameraView
        onPermissionChange={setHasPermission}
        onError={setError}
        onAnalysis={setAnalysis}
      />
      
      {/* Debug: Show analysis result */}
      {analysis && (
        <div className="fixed top-20 left-4 right-4 glass rounded-xl p-4 max-h-40 overflow-auto">
          <h2 className="font-semibold text-emerald-400">{analysis.scene_title}</h2>
          <p className="text-sm text-white/80 mt-1">{analysis.narration}</p>
          <p className="text-xs text-white/50 mt-2">
            {analysis.pois.length} POI(s) found
          </p>
        </div>
      )}
    </main>
  );
}
