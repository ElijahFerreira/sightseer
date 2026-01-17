import { NextRequest, NextResponse } from 'next/server';
// import { analyzeSceneWithGemini, SceneAnalysis } from '@/lib/gemini';
import { analyzeSceneWithOpenAI, SceneAnalysis } from '@/lib/openai';

// Session storage (in-memory for now)
const sessions = new Map<string, SessionData>();

interface SessionData {
  id: string;
  memory: string[];
  lastScene: SceneAnalysis | null;
  createdAt: Date;
  updatedAt: Date;
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

    // Call OpenAI API with the image
    const analysis = await analyzeSceneWithOpenAI(image, {
      locationHint: location_hint,
      interests,
      sessionMemory: session.memory,
    });

    // Update session with summary of this scene
    session.memory.push(`Saw: ${analysis.scene_title} - ${analysis.scene_summary}`);
    session.lastScene = analysis;
    session.updatedAt = new Date();

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
