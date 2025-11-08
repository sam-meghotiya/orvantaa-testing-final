import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, SendIcon, CameraIcon, ImageIcon, MicIcon } from './icons/Icons.tsx';

interface SearchBarProps {
  onSearch: (query: string, image?: string | null) => void;
  query: string;
  setQuery: (query: string) => void;
  isLoading: boolean;
  selectedImage: string | null;
  onImageSelect: (base64: string) => void;
  onRemoveImage: () => void;
  onCameraClick: () => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  query,
  setQuery,
  isLoading,
  selectedImage,
  onImageSelect,
  onRemoveImage,
  onCameraClick,
  isListening,
  startListening,
  stopListening,
  hasRecognitionSupport,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && (query.trim() || selectedImage)) {
      if (navigator.vibrate) navigator.vibrate(10);
      onSearch(query, selectedImage);
      setIsMenuOpen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
        setIsMenuOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageIconClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleMicClick = () => {
    if (navigator.vibrate) navigator.vibrate(5);
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-lg lg:max-w-2xl">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center w-full bg-[#2C2C2E] rounded-3xl p-2 pr-1.5 transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-white/50">
          <div className="relative" ref={menuRef}>
            <button 
                type="button"
                onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(5);
                    setIsMenuOpen(!isMenuOpen);
                }}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white"
                aria-label="Add attachment"
            >
                <PlusIcon />
            </button>
            {isMenuOpen && (
              <div className="absolute bottom-full left-0 mb-3 w-36 bg-[var(--bg-popover)] border border-[var(--border-popover)] rounded-xl shadow-lg p-2 flex flex-col items-start gap-1 animate-fade-in-up z-10">
                <button
                  type="button"
                  onClick={() => {
                      if (navigator.vibrate) navigator.vibrate(5);
                      onCameraClick();
                      setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors text-white"
                >
                  <CameraIcon />
                  <span>Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                      if (navigator.vibrate) navigator.vibrate(5);
                      handleImageIconClick();
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors text-white"
                >
                  <ImageIcon />
                  <span>Photos</span>
                </button>
              </div>
            )}
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything..."
            disabled={isLoading}
            className="w-full h-full px-2 bg-transparent text-white placeholder-gray-500 border-none rounded-full outline-none focus:ring-0 disabled:opacity-50"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          {hasRecognitionSupport && (
            <button type="button" onClick={handleMicClick} className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isListening ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>
                <MicIcon />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || (!query.trim() && !selectedImage)}
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#00A9FF] text-white rounded-full disabled:bg-gray-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            aria-label="Submit query"
          >
            <SendIcon />
          </button>
        </div>
      </form>
      <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.2s ease-out forwards;
          }
        `}</style>
    </div>
  );
};