'use client';

import { SceneAnalysis } from '@/lib/api';
import QuestionInput from './QuestionInput';

interface NarrationPanelProps {
  analysis: SceneAnalysis;
  isScanning?: boolean;
  isAskingQuestion?: boolean;
  lastAnswer?: string | null;
  suggestedQuestions?: string[];
  onScan: () => void;
  onAskQuestion: (question: string) => void;
}

export default function NarrationPanel({ 
  analysis, 
  isScanning = false,
  isAskingQuestion = false,
  lastAnswer = null,
  suggestedQuestions,
  onScan,
  onAskQuestion 
}: NarrationPanelProps) {
  // Use provided suggestions or fall back to analysis suggestions
  const questions = suggestedQuestions || analysis.suggested_questions;

  return (
    <div className="narration-panel pt-6 pb-6">
      <div className="px-4 space-y-4">
        {/* Scene Title */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-emerald-400">
            {analysis.scene_title}
          </h2>
        </div>

        {/* Narration or Last Answer */}
        <p className="text-sm text-white/90 text-center leading-relaxed">
          {lastAnswer || analysis.narration}
        </p>

        {/* Safety notes (if any and no answer shown) */}
        {!lastAnswer && analysis.safety_notes.length > 0 && analysis.safety_notes[0] && (
          <p className="text-xs text-amber-400/80 text-center italic">
            ⚠️ {analysis.safety_notes[0]}
          </p>
        )}

        {/* Question Input */}
        <QuestionInput 
          onSubmit={onAskQuestion}
          isLoading={isAskingQuestion}
          placeholder="Ask about what you see..."
        />

        {/* Suggested Questions */}
        {questions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {questions.slice(0, 3).map((question, idx) => (
              <button
                key={idx}
                className="question-chip"
                onClick={() => onAskQuestion(question)}
                disabled={isAskingQuestion}
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {/* Scan Again Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={onScan}
            disabled={isScanning || isAskingQuestion}
            className={`scan-button ${isScanning ? 'scanning' : ''}`}
          >
            {isScanning ? (
              <div className="spinner" />
            ) : (
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
