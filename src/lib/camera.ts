/**
 * Camera utilities for capturing and processing frames
 */

export interface CameraConstraints {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}

/**
 * Request camera access with specified constraints
 */
export async function requestCameraAccess(
  constraints: CameraConstraints = {}
): Promise<MediaStream> {
  const {
    facingMode = 'environment',
    width = 1280,
    height = 720,
  } = constraints;

  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode,
      width: { ideal: width },
      height: { ideal: height },
    },
    audio: false,
  });
}

/**
 * Capture a frame from a video element and return as base64 JPEG
 */
export function captureVideoFrame(
  video: HTMLVideoElement,
  targetWidth: number = 640,
  quality: number = 0.8
): string | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Calculate dimensions maintaining aspect ratio
  const aspectRatio = video.videoHeight / video.videoWidth;
  const targetHeight = Math.round(targetWidth * aspectRatio);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Draw and compress
  ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Check if camera is available
 */
export async function isCameraAvailable(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((device) => device.kind === 'videoinput');
  } catch {
    return false;
  }
}

/**
 * Stop all tracks in a media stream
 */
export function stopMediaStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}
