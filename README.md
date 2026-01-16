# Sightseer - AR Tour Guide

A mobile web AR tour guide that understands what you're pointing at and overlays contextual stories and answers in real time using Gemini's multimodal reasoning.

## Features

- 📷 **Camera-based scene analysis** - Point at landmarks, art, or objects
- 🏷️ **Interactive overlays** - POIs pinned to the live camera view
- 💬 **Conversational Q&A** - Ask follow-up questions about what you see
- 🧠 **Context-aware** - Remembers your tour and adapts to your interests

## Getting Started

### Prerequisites

- Node.js 18+
- A Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Run development server
npm run dev
```

### Testing on Mobile

For camera access to work, you need HTTPS. Options:

1. **Local network** - Access via your computer's IP (may work on some devices)
2. **ngrok** - `ngrok http 3000` for a public HTTPS URL
3. **Deploy** - Push to Vercel for instant HTTPS

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **API**: Next.js API Routes
- **AI**: Google Gemini 2.0 Flash (multimodal)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/    # Scene analysis endpoint
│   │   └── ask/        # Q&A endpoint
│   ├── layout.tsx      # Mobile-optimized layout
│   ├── page.tsx        # Main camera view
│   └── globals.css     # AR overlay styles
├── components/
│   └── CameraView.tsx  # Camera + overlay component
└── lib/
    ├── api.ts          # API client functions
    └── camera.ts       # Camera utilities
```

## Development Plan

See [DEV_PLAN.md](./DEV_PLAN.md) for the full development checklist.

## License

MIT
