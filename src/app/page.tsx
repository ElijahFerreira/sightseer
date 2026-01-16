'use client';

import { useState, useEffect } from 'react';
import CameraView from '@/components/CameraView';

export default function Home() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      />
    </main>
  );
}
