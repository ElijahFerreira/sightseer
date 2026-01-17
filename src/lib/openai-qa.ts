import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const QA_SYSTEM_PROMPT = `You are an expert tour guide assistant. The user is looking at a scene through their camera and has asked a follow-up question.

You have context about what they're viewing. Answer their question helpfully and conversationally.

Guidelines:
- Be concise but informative (2-4 sentences)
- If the question is about something in the scene, reference it specifically
- Suggest 2 natural follow-up questions they might want to ask
- If you're unsure, be honest about it

Respond with valid JSON in this format:
{
  "answer": "Your helpful answer here",
  "follow_up_suggestions": ["Follow-up question 1", "Follow-up question 2"]
}`;

export interface QAOptions {
  sceneContext?: string;
  sessionMemory?: string[];
}

export interface QAResponse {
  answer: string;
  follow_up_suggestions: string[];
}

/**
 * Answer a question about the current scene using OpenAI
 */
export async function answerQuestionWithOpenAI(
  question: string,
  imageBase64: string | null,
  options: QAOptions = {}
): Promise<QAResponse> {
  const { sceneContext, sessionMemory } = options;

  let systemPrompt = QA_SYSTEM_PROMPT;
  
  if (sceneContext) {
    systemPrompt += `\n\nCurrent scene context:\n${sceneContext}`;
  }
  
  if (sessionMemory && sessionMemory.length > 0) {
    systemPrompt += `\n\nConversation history:\n${sessionMemory.slice(-5).join('\n')}`;
  }

  // Build message content
  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: 'text', text: question },
  ];

  // Include image if provided
  if (imageBase64) {
    const imageUrl = imageBase64.startsWith('data:') 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;
    
    userContent.push({
      type: 'image_url',
      image_url: {
        url: imageUrl,
        detail: 'low',
      },
    });
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content || '{}';
  const result: QAResponse = JSON.parse(text);
  
  return result;
}
