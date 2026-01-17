'use client';

import { useState, useEffect, useRef } from 'react';
import CameraView, { CameraViewRef } from '@/components/CameraView';
import OverlayPins from '@/components/OverlayPins';
import NarrationPanel from '@/components/NarrationPanel';
import { SceneAnalysis } from '@/lib/api';

export default function Home() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SceneAnalysis | null>(null);
  const cameraRef = useRef<CameraViewRef>(null);

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
        ref={cameraRef}
        onPermissionChange={setHasPermission}
        onError={setError}
        onAnalysis={setAnalysis}
        hasAnalysis={!!analysis}
      />
      
      {/* POI Overlay Pins */}
      {analysis && analysis.pois.length > 0 && (
        <OverlayPins 
          pois={analysis.pois}
          onPoiTap={(poi) => console.log('Tapped POI:', poi.label)}
        />
      )}

      {/* Narration Panel with results */}
      {analysis && (
        <NarrationPanel
          analysis={analysis}
          isScanning={cameraRef.current?.isScanning}
          onScan={() => cameraRef.current?.triggerScan()}
          onQuestionTap={(q) => console.log('Question tapped:', q)}
        />
      )}
    </main>
  );
}
