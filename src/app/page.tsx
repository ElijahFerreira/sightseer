'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import CameraView, { CameraViewRef } from '@/components/CameraView';
import OverlayPins from '@/components/OverlayPins';
import NarrationPanel from '@/components/NarrationPanel';
import ToastContainer, { useToasts } from '@/components/ToastContainer';
import LoadingOverlay from '@/components/LoadingOverlay';
import { SceneAnalysis, askQuestion, AskResponse } from '@/lib/api';

// Get session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = sessionStorage.getItem('sightseer_session');
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('sightseer_session', id);
  }
  return id;
}

export default function Home() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SceneAnalysis | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[] | null>(null);
  const cameraRef = useRef<CameraViewRef>(null);
  const { toasts, addToast, dismissToast } = useToasts();

  // Handle asking a question
  const handleAskQuestion = useCallback(async (question: string) => {
    if (!analysis || isAskingQuestion) return;

    setIsAskingQuestion(true);
    try {
      const response: AskResponse = await askQuestion({
        question,
        session_id: getSessionId(),
      });

      setLastAnswer(response.answer);
      if (response.follow_up_suggestions?.length > 0) {
        setSuggestedQuestions(response.follow_up_suggestions);
      }
    } catch (err) {
      console.error('Failed to ask question:', err);
      const message = err instanceof Error ? err.message : 'Failed to ask question';
      addToast(message, 'error');
    } finally {
      setIsAskingQuestion(false);
    }
  }, [analysis, isAskingQuestion, addToast]);

  // Reset Q&A state when new analysis comes in
  const handleAnalysis = useCallback((newAnalysis: SceneAnalysis) => {
    setAnalysis(newAnalysis);
    setLastAnswer(null);
    setSuggestedQuestions(null);
    setIsScanning(false);
    addToast('Scene analyzed successfully!', 'success');
  }, [addToast]);

  // Handle scan errors gracefully
  const handleError = useCallback((errorMessage: string) => {
    // For non-critical errors, show toast instead of error screen
    if (errorMessage.includes('Analysis') || errorMessage.includes('fetch')) {
      addToast(errorMessage, 'error');
      setIsScanning(false);
    } else {
      // Critical errors (camera, permissions) go to error screen
      setError(errorMessage);
    }
  }, [addToast]);

  // Trigger scan with loading state
  const handleScan = useCallback(() => {
    setIsScanning(true);
    cameraRef.current?.triggerScan();
  }, []);

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
        onError={handleError}
        onAnalysis={handleAnalysis}
        hasAnalysis={!!analysis}
      />
      
      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isScanning} message="Analyzing scene..." />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
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
          isScanning={isScanning}
          isAskingQuestion={isAskingQuestion}
          lastAnswer={lastAnswer}
          suggestedQuestions={suggestedQuestions || undefined}
          onScan={handleScan}
          onAskQuestion={handleAskQuestion}
        />
      )}
    </main>
  );
}
