const API_BASE = '/api';

export interface SceneAnalysis {
  scene_title: string;
  scene_summary: string;
  narration: string;
  pois: POI[];
  suggested_questions: string[];
  safety_notes: string[];
}

export interface POI {
  id: string;
  label: string;
  why_it_matters: string;
  screen_anchor: { x: number; y: number };
  confidence: number;
}

export interface AskResponse {
  answer: string;
  updated_pois: POI[] | null;
  follow_up_suggestions: string[];
}

export interface AnalyzeRequest {
  image: string; // base64 encoded
  session_id: string;
  location_hint?: string;
  interests?: string[];
}

export interface AskRequest {
  question: string;
  image?: string; // optional: include current frame
  session_id: string;
}

/**
 * Analyze a scene from a camera frame
 */
export async function analyzeScene(request: AnalyzeRequest): Promise<SceneAnalysis> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze scene');
  }

  return response.json();
}

/**
 * Ask a follow-up question about the current scene
 */
export async function askQuestion(request: AskRequest): Promise<AskResponse> {
  const response = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process question');
  }

  return response.json();
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
