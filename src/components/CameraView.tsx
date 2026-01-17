'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { analyzeScene, SceneAnalysis } from '@/lib/api';

// Generate a simple session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = sessionStorage.getItem('sightseer_session');
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('sightseer_session', id);
  }
  return id;
}

interface CameraViewProps {
  onPermissionChange: (granted: boolean) => void;
  onError: (error: string) => void;
  onAnalysis?: (analysis: SceneAnalysis) => void;
}

export default function CameraView({ onPermissionChange, onError, onAnalysis }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Initialize camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    async function initCamera() {
      try {
        // Request camera with mobile-optimized constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        // Check if component is still mounted
        if (!isMounted || !videoRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        videoRef.current.srcObject = stream;
        
        // Use onloadedmetadata to ensure video is ready before playing
        videoRef.current.onloadedmetadata = async () => {
          if (isMounted && videoRef.current) {
            try {
              await videoRef.current.play();
              setIsReady(true);
              onPermissionChange(true);
            } catch (playErr) {
              // Ignore AbortError from unmount
              if (playErr instanceof Error && playErr.name !== 'AbortError') {
                console.error('Play error:', playErr);
              }
            }
          }
        };
      } catch (err) {
        console.error('Camera error:', err);
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            onPermissionChange(false);
          } else if (err.name !== 'AbortError') {
            onError(`Camera error: ${err.message}`);
          }
        }
      }
    }

    initCamera();

    // Cleanup
    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onPermissionChange, onError]);

  // Capture frame from video
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Target width for compression (512-768px as per plan)
    const targetWidth = 640;
    const aspectRatio = video.videoHeight / video.videoWidth;
    const targetHeight = Math.round(targetWidth * aspectRatio);

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

    // Convert to JPEG with compression
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Handle scan button press
  const handleScan = useCallback(async () => {
    if (isScanning) return;

    setIsScanning(true);

    try {
      const frameData = captureFrame();
      if (!frameData) {
        throw new Error('Failed to capture frame');
      }

      // Send frame to /api/analyze endpoint
      const analysis = await analyzeScene({
        image: frameData,
        session_id: getSessionId(),
      });

      console.log('Analysis received:', analysis.scene_title);

      // Pass analysis to parent component
      if (onAnalysis) {
        onAnalysis(analysis);
      }
    } catch (err) {
      console.error('Scan error:', err);
      onError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, captureFrame, onError, onAnalysis]);

  return (
    <div className="camera-container">
      {/* Camera video feed */}
      <video
        ref={videoRef}
        className="camera-video"
        playsInline
        muted
        autoPlay
      />

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay container for POIs - to be implemented */}
      <div className="overlay-container">
        {/* POI pins will be rendered here */}
      </div>

      {/* Top bar with title */}
      <div className="fixed top-0 left-0 right-0 p-4 pt-[calc(var(--safe-area-inset-top)+1rem)]">
        <div className="glass rounded-xl px-4 py-2 inline-block">
          <h1 className="text-lg font-semibold">Sightseer</h1>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="narration-panel pt-8 pb-6">
        <div className="flex flex-col items-center gap-4 px-4">
          {/* Status text */}
          <p className="text-white/70 text-sm">
            {!isReady
              ? 'Starting camera...'
              : isScanning
              ? 'Analyzing scene...'
              : 'Point at a landmark and tap Scan'}
          </p>

          {/* Scan button */}
          <button
            onClick={handleScan}
            disabled={!isReady || isScanning}
            className={`scan-button ${isScanning ? 'scanning' : ''}`}
          >
            {isScanning ? (
              <div className="spinner" />
            ) : (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
