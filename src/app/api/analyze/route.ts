import { NextRequest, NextResponse } from 'next/server';

// Session storage (in-memory for now)
const sessions = new Map<string, SessionData>();

interface SessionData {
  id: string;
  memory: string[];
  lastScene: SceneAnalysis | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SceneAnalysis {
  scene_title: string;
  scene_summary: string;
  narration: string;
  pois: POI[];
  suggested_questions: string[];
  safety_notes: string[];
}

interface POI {
  id: string;
  label: string;
  why_it_matters: string;
  screen_anchor: { x: number; y: number };
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, session_id, location_hint, interests } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Get or create session
    let session = sessions.get(session_id);
    if (!session) {
      session = {
        id: session_id,
        memory: [],
        lastScene: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      sessions.set(session_id, session);
    }

    // TODO: Call Gemini API with the image
    // For now, return a mock response
    const mockResponse: SceneAnalysis = {
      scene_title: 'Demo Scene',
      scene_summary: 'This is a placeholder response. Gemini integration coming next!',
      narration: 'Point your camera at a landmark to see the AI analysis.',
      pois: [
        {
          id: 'demo_poi_1',
          label: 'Sample Point',
          why_it_matters: 'This is where a real point of interest would appear.',
          screen_anchor: { x: 0.5, y: 0.3 },
          confidence: 0.85,
        },
      ],
      suggested_questions: [
        'What is this place?',
        'When was it built?',
        'What makes it significant?',
      ],
      safety_notes: ['This is a demo response - Gemini integration pending.'],
    };

    // Update session
    session.lastScene = mockResponse;
    session.updatedAt = new Date();

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
