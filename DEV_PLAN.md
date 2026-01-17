# Overlay AR Tour Guide - Development Plan

> A mobile web AR tour guide that understands what you're pointing at and overlays contextual stories and answers in real time using Gemini's multimodal reasoning.

---

## Quick Reference

- **Frontend**: Next.js + React
- **Backend**: Express.js (Node)
- **AI**: Gemini 2.0 Flash (multimodal)
- **Target**: Mobile web (iOS Safari, Android Chrome)

---

## Development Checklist

### Day 0: Project Setup (1-2 hours)

- [x] **1. Project Setup** ✅
  - [x] Initialize git repo
  - [x] Set up Next.js frontend
  - [x] Set up backend (using Next.js API routes)
  - [x] Configure environment variables (GEMINI_API_KEY)
  - [x] Create basic mobile-first layout
  - [x] Verify frontend + backend run locally

---

### Day 1: Camera Pipeline

- [ ] **2. Camera Preview**
  - [ ] Implement `getUserMedia` for mobile camera
  - [ ] Display live camera preview (full screen)
  - [ ] Handle camera permission requests gracefully
  - [ ] Handle permission denied state
  - [ ] Test on mobile device

- [ ] **3. Frame Capture Pipeline**
  - [ ] Capture frame to canvas element
  - [ ] Resize/compress to ~512-768px width (JPEG)
  - [ ] Implement "Scan" button to trigger capture
  - [ ] (Optional) Auto-scan interval (every 2-3 seconds)
  - [ ] Send frame to backend endpoint
  - [ ] Verify backend receives frames correctly

---

### Day 2: Gemini Integration + Overlays

- [ ] **4. Backend /analyze Endpoint**
  - [ ] Create POST `/api/analyze` endpoint
  - [ ] Receive base64 image from frontend
  - [ ] Store/retrieve session state by session_id
  - [ ] Build Gemini prompt template for scene analysis
  - [ ] Return structured JSON response

- [ ] **5. Gemini Integration**
  - [ ] Install `@google/generative-ai` package
  - [ ] Configure Gemini client with API key
  - [ ] Implement multimodal call (image + text)
  - [ ] Enforce JSON-only structured output
  - [ ] Define response schema:
    ```json
    {
      "scene_title": "string",
      "scene_summary": "string",
      "narration": "string",
      "pois": [
        {
          "id": "string",
          "label": "string",
          "why_it_matters": "string",
          "screen_anchor": { "x": 0.0-1.0, "y": 0.0-1.0 },
          "confidence": 0.0-1.0
        }
      ],
      "suggested_questions": ["string"],
      "safety_notes": ["string"]
    }
    ```
  - [ ] Handle API errors gracefully
  - [ ] Add retry logic for failed requests

- [ ] **6. Overlay UI Renderer**
  - [ ] Create overlay container (absolute positioned over camera)
  - [ ] Render POI pins at normalized (x,y) coordinates
  - [ ] Style POI labels (readable, semi-transparent background)
  - [ ] Show scene title at top
  - [ ] Show narration panel at bottom
  - [ ] Make POI pins tappable (show details)

---

### Day 3: Q&A + Memory + Polish

- [ ] **7. Q&A Feature**
  - [ ] Add text input field for questions
  - [ ] Create POST `/api/ask` endpoint
  - [ ] Pass question + current frame + session memory to Gemini
  - [ ] Display answer in chat/narration panel
  - [ ] (Optional) Update POIs based on answer

- [ ] **8. Session Memory**
  - [ ] Implement in-memory session store (Map)
  - [ ] Store conversation history per session
  - [ ] Summarize conversation each turn (keep context compact)
  - [ ] Include memory in Gemini prompts
  - [ ] Clear/reset session option

- [ ] **9. Suggested Questions UI**
  - [ ] Display Gemini's suggested questions as chips/buttons
  - [ ] Position below narration or as floating pills
  - [ ] Tap chip → auto-fill and submit question
  - [ ] Update chips after each response

- [ ] **10. Polish & Error Handling**
  - [ ] Add loading spinner during analysis
  - [ ] Show "Analyzing scene..." state
  - [ ] Display confidence indicators on POIs
  - [ ] Show "I might be wrong" for low confidence
  - [ ] Add "Rescan" prompt when confidence is low
  - [ ] Handle network errors gracefully
  - [ ] Add empty state (no POIs found)

---

### Day 4: Demo & Stretch Goals

- [ ] **11. Demo Preparation**
  - [ ] Choose demo target (landmark photo / real location / object)
  - [ ] Test complete end-to-end flow
  - [ ] Script the demo (60-90 seconds)
  - [ ] Record demo video
  - [ ] Prepare Devpost submission
  - [ ] Create architecture diagram
  - [ ] Write project description

- [ ] **12. [STRETCH] Voice Input/TTS**
  - [ ] Implement Web Speech API for voice input
  - [ ] Add push-to-talk button
  - [ ] Implement SpeechSynthesis for narration
  - [ ] Toggle voice on/off setting

---

## File Structure (Target)

```
ar_gemini/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Main camera view
│   │   │   ├── layout.tsx        # Mobile layout
│   │   │   └── globals.css       # Mobile-first styles
│   │   ├── components/
│   │   │   ├── CameraView.tsx    # Camera + overlay container
│   │   │   ├── OverlayPins.tsx   # POI pins renderer
│   │   │   ├── NarrationPanel.tsx
│   │   │   ├── QuestionInput.tsx
│   │   │   └── SuggestedChips.tsx
│   │   └── lib/
│   │       ├── api.ts            # Backend API calls
│   │       └── camera.ts         # Camera utilities
│   ├── package.json
│   └── next.config.js
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server
│   │   ├── routes/
│   │   │   ├── analyze.ts        # /api/analyze
│   │   │   └── ask.ts            # /api/ask
│   │   ├── services/
│   │   │   └── gemini.ts         # Gemini API wrapper
│   │   ├── prompts/
│   │   │   ├── scene-analysis.ts
│   │   │   └── qa.ts
│   │   └── store/
│   │       └── sessions.ts       # In-memory session store
│   ├── package.json
│   └── tsconfig.json
├── .env.example
├── DEV_PLAN.md                   # This file
└── README.md
```

---

## Key Prompts Reference

### Scene Analysis System Prompt
```
You are an expert tour guide with deep knowledge of landmarks, art, architecture, and history.
Analyze the image and return ONLY valid JSON.
Be honest about uncertainty - include confidence scores.
Place POIs with approximate screen anchors (0-1 normalized coordinates).
```

### Q&A System Prompt
```
You are a tour guide answering questions about the current scene.
Use the conversation history for context.
Ground your answers in what's visible in the image.
If asked about something not in view, say so politely.
Return ONLY valid JSON.
```

---

## Demo Script (Template)

1. **Open app** → Camera view appears
2. **Point at landmark** → Tap "Scan"
3. **Overlays appear** → POI pins + narration
4. **Tap a POI** → See details
5. **Tap suggested question** → Answer appears
6. **Ask custom question** → "What's the statue on the left?"
7. **Gemini answers** → Grounded in current view
8. **Close** → "That's Overlay - your AI tour guide"

---

## Notes

- Keep frames small (~512px) for faster API response
- Test on real mobile device early and often
- Prefer printed photos for reproducible demos
- JSON schema enforcement prevents parsing errors
- Session memory keeps context without token explosion

---

*Last updated: January 15, 2026*
