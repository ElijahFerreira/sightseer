import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for scene analysis
const SCENE_ANALYSIS_PROMPT = `You are an expert tour guide with deep knowledge of landmarks, art, architecture, history, nature, and everyday objects.

Analyze the image and provide helpful, engaging information about what you see.

Guidelines:
- Be conversational and engaging in the narration
- Identify the most interesting or notable elements as POIs
- Place POI screen anchors where the object actually appears in the image (0,0 is top-left, 1,1 is bottom-right)
- Be honest about uncertainty - use lower confidence scores when unsure
- Suggest natural follow-up questions the user might want to ask
- Include safety notes if you're uncertain about any identification

If you cannot identify anything meaningful in the image, still provide a response with an empty POIs array and a helpful narration explaining what you see.

You MUST respond with valid JSON in this exact format:
{
  "scene_title": "string - A short, descriptive title for the scene",
  "scene_summary": "string - A brief summary of what is in the scene",
  "narration": "string - A conversational tour guide narration (2-3 sentences)",
  "pois": [
    {
      "id": "string - unique identifier",
      "label": "string - short label (1-3 words)",
      "why_it_matters": "string - brief explanation",
      "screen_anchor": { "x": 0.0-1.0, "y": 0.0-1.0 },
      "confidence": 0.0-1.0
    }
  ],
  "suggested_questions": ["string array of follow-up questions"],
  "safety_notes": ["string array of accuracy notes"]
}`;

export interface AnalyzeOptions {
  locationHint?: string;
  interests?: string[];
  sessionMemory?: string[];
}

export interface SceneAnalysis {
  scene_title: string;
  scene_summary: string;
  narration: string;
  pois: {
    id: string;
    label: string;
    why_it_matters: string;
    screen_anchor: { x: number; y: number };
    confidence: number;
  }[];
  suggested_questions: string[];
  safety_notes: string[];
}

/**
 * Analyze a scene from a camera frame using OpenAI GPT-4o-mini
 */
export async function analyzeSceneWithOpenAI(
  imageBase64: string,
  options: AnalyzeOptions = {}
): Promise<SceneAnalysis> {
  const { locationHint, interests, sessionMemory } = options;

  // Build the prompt with optional context
  let prompt = SCENE_ANALYSIS_PROMPT;
  
  if (locationHint) {
    prompt += `\n\nLocation hint: ${locationHint}`;
  }
  
  if (interests && interests.length > 0) {
    prompt += `\n\nUser interests: ${interests.join(', ')}`;
  }
  
  if (sessionMemory && sessionMemory.length > 0) {
    prompt += `\n\nPrevious context from this tour:\n${sessionMemory.slice(-3).join('\n')}`;
  }

  // Ensure proper data URL format
  const imageUrl = imageBase64.startsWith('data:') 
    ? imageBase64 
    : `data:image/jpeg;base64,${imageBase64}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'low', // Use low detail to reduce cost
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content || '{}';
  const analysis: SceneAnalysis = JSON.parse(text);
  
  return analysis;
}
