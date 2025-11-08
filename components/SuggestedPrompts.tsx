import React, { useState, useEffect, useCallback } from 'react';
import { ShuffleIcon } from './icons/Icons.tsx';
import { SUGGESTED_PROMPTS } from './constants.ts';

interface SuggestedPromptsProps {
  onPromptSelect: (prompt: string) => void;
  prompts?: string[] | null;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onPromptSelect, prompts }) => {
  const [displayPrompts, setDisplayPrompts] = useState<string[]>([]);
  const [key, setKey] = useState(0);

  const shufflePrompts = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SUGGESTED_PROMPTS.length);
    setDisplayPrompts(SUGGESTED_PROMPTS[randomIndex]);
    setKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (prompts && prompts.length > 0) {
      setDisplayPrompts(prompts);
    } else {
      shufflePrompts();
    }
    setKey(prev => prev + 1);
  }, [prompts, shufflePrompts]);
  
  const showShuffleButton = !prompts || prompts.length === 0;

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {displayPrompts.map((prompt, index) => (
          <button
            key={`${key}-${index}`}
            onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                onPromptSelect(prompt);
            }}
            className="px-4 py-2 text-xs md:text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200 hover:text-black transition-all duration-200"
            style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
          >
            {prompt}
          </button>
        ))}
        {showShuffleButton && (
            <button
              onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(5);
                  shufflePrompts();
              }}
              className="p-2.5 bg-gray-100 border border-gray-200 rounded-full text-gray-600 hover:text-black hover:bg-gray-200 transition-transform duration-200 hover:rotate-45"
              aria-label="Shuffle prompts"
            >
              <ShuffleIcon />
            </button>
        )}
      </div>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};