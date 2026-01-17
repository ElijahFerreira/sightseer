'use client';

import { useState, FormEvent } from 'react';

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function QuestionInput({ 
  onSubmit, 
  isLoading = false,
  placeholder = "Ask a question..."
}: QuestionInputProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
      setQuestion('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full 
                   text-white placeholder-white/50 border border-white/20
                   focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/30
                   disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!question.trim() || isLoading}
        className="px-4 py-2 bg-emerald-500 rounded-full font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all active:scale-95"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        )}
      </button>
    </form>
  );
}
