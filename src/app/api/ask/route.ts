import { NextRequest, NextResponse } from 'next/server';

// Reference to the same session storage (in production, use Redis or similar)
const sessions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, image, session_id } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'No question provided' },
        { status: 400 }
      );
    }

    // Get session
    const session = sessions.get(session_id);

    // TODO: Call Gemini API with question + image + context
    // For now, return a mock response
    const mockResponse = {
      answer: `You asked: "${question}". This is a placeholder response. Gemini integration coming next!`,
      updated_pois: null, // POIs can be updated based on the question
      follow_up_suggestions: [
        'Tell me more about this',
        'What else is interesting here?',
      ],
    };

    // Update session memory if exists
    if (session) {
      session.memory.push({
        role: 'user',
        content: question,
      });
      session.memory.push({
        role: 'assistant',
        content: mockResponse.answer,
      });
      session.updatedAt = new Date();
    }

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Ask error:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}
