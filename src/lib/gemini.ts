import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Response schema for scene analysis
const sceneAnalysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    scene_title: {
      type: SchemaType.STRING,
      description: 'A short, descriptive title for the scene',
    },
    scene_summary: {
      type: SchemaType.STRING,
      description: 'A brief summary of what is in the scene',
    },
    narration: {
      type: SchemaType.STRING,
      description: 'A conversational tour guide narration about the scene (2-3 sentences)',
    },
    pois: {
      type: SchemaType.ARRAY,
      description: 'Points of interest identified in the image',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: {
            type: SchemaType.STRING,
            description: 'Unique identifier for this POI',
          },
          label: {
            type: SchemaType.STRING,
            description: 'Short label for the POI (1-3 words)',
          },
          why_it_matters: {
            type: SchemaType.STRING,
            description: 'Brief explanation of why this is interesting or significant',
          },
          screen_anchor: {
            type: SchemaType.OBJECT,
            description: 'Approximate position on screen where this POI appears',
            properties: {
              x: {
                type: SchemaType.NUMBER,
                description: 'X position (0.0 = left edge, 1.0 = right edge)',
              },
              y: {
                type: SchemaType.NUMBER,
                description: 'Y position (0.0 = top edge, 1.0 = bottom edge)',
              },
            },
            required: ['x', 'y'],
          },
          confidence: {
            type: SchemaType.NUMBER,
            description: 'Confidence score from 0.0 to 1.0',
          },
        },
        required: ['id', 'label', 'why_it_matters', 'screen_anchor', 'confidence'],
      },
    },
    suggested_questions: {
      type: SchemaType.ARRAY,
      description: 'Follow-up questions the user might want to ask',
      items: {
        type: SchemaType.STRING,
      },
    },
    safety_notes: {
      type: SchemaType.ARRAY,
      description: 'Any safety or accuracy notes (e.g., "I might be wrong about...")',
      items: {
        type: SchemaType.STRING,
      },
    },
  },
  required: ['scene_title', 'scene_summary', 'narration', 'pois', 'suggested_questions', 'safety_notes'],
};

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

If you cannot identify anything meaningful in the image, still provide a response with an empty POIs array and a helpful narration explaining what you see.`;

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
 * Analyze a scene from a camera frame using Gemini
 */
export async function analyzeSceneWithGemini(
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

  // Get the Gemini model with JSON schema output
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: sceneAnalysisSchema,
    },
  });

  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Data = imageBase64.includes(',') 
    ? imageBase64.split(',')[1] 
    : imageBase64;

  // Call Gemini with the image
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data,
      },
    },
  ]);

  const response = result.response;
  const text = response.text();
  
  // Parse the JSON response
  const analysis: SceneAnalysis = JSON.parse(text);
  
  return analysis;
}
