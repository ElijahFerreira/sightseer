# Sightseer - AR Tour Guide

A mobile web AR tour guide that understands what you're pointing at and overlays contextual stories and answers in real time using AI vision.

## Features

- 📷 **Camera-based scene analysis** - Point at landmarks, art, or objects
- 🏷️ **Interactive overlays** - POIs pinned to the live camera view
- 💬 **Conversational Q&A** - Ask follow-up questions about what you see
- 🧠 **Context-aware** - Remembers your tour and adapts to your interests
- ⚡ **Loading states** - Smooth visual feedback during AI processing
- 🔔 **Toast notifications** - Non-blocking error and success messages

## Getting Started

### Prerequisites

- Node.js 18+
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY

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
- **AI**: OpenAI GPT-4o-mini (vision-capable)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/       # Scene analysis endpoint
│   │   └── ask/           # Q&A endpoint
│   ├── layout.tsx         # Mobile-optimized layout
│   ├── page.tsx           # Main camera view + state management
│   └── globals.css        # AR overlay styles
├── components/
│   ├── CameraView.tsx     # Camera capture + video preview
│   ├── OverlayPins.tsx    # POI markers on camera view
│   ├── NarrationPanel.tsx # Bottom panel with narration + Q&A
│   ├── QuestionInput.tsx  # Text input for questions
│   ├── ToastContainer.tsx # Toast notification system
│   └── LoadingOverlay.tsx # Full-screen loading indicator
└── lib/
    ├── api.ts             # API client functions
    ├── camera.ts          # Camera utilities
    ├── openai.ts          # Scene analysis with GPT-4o-mini
    └── openai-qa.ts       # Q&A with GPT-4o-mini
```

## Development Plan

See [DEV_PLAN.md](./DEV_PLAN.md) for the full development checklist.

## License

MIT
