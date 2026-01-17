import { NextRequest, NextResponse } from 'next/server';
import { answerQuestionWithOpenAI } from '@/lib/openai-qa';

// Reference to the same session storage (in production, use Redis or similar)
const sessions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, image, session_id, scene_context } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'No question provided' },
        { status: 400 }
      );
    }

    // Get session
    const session = sessions.get(session_id);
    const sessionMemory = session?.memory || [];

    // Call OpenAI with question + image + context
    const result = await answerQuestionWithOpenAI(question, image || null, {
      sceneContext: scene_context,
      sessionMemory,
    });

    const response = {
      answer: result.answer,
      updated_pois: null,
      follow_up_suggestions: result.follow_up_suggestions,
    };

    // Update session memory if exists
    if (session) {
      session.memory.push(`User asked: ${question}`);
      session.memory.push(`Assistant: ${response.answer}`);
      session.updatedAt = new Date();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Ask error:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}
