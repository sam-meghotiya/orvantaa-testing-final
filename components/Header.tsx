import React, { useState, useEffect } from 'react';
import { HistoryIcon, PlusIcon, CloseIcon, ProfileIcon, MoonIcon, SunIcon } from './icons/Icons.tsx';
import { ChatSession } from '../types.ts';

type View = 'chat' | 'explore' | 'history' | 'quizzes' | 'subjects' | 'mindmaps';

interface HeaderProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onShowHistory: () => void;
  currentView: View;
}

const DropdownMenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <button
    onClick={() => {
        if (navigator.vibrate) navigator.vibrate(5);
        onClick();
    }}
    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md text-[var(--text-secondary)] hover:bg-[var(--accent-soft-bg)] hover:text-white transition-colors"
    role="menuitem"
  >
    {icon}
    <span>{label}</span>
  </button>
);

const TabMenuItem: React.FC<{
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}> = ({ session, isActive, onSelect, onClose }) => (
  <div
    className={`flex items-center group w-full rounded-md transition-colors ${
        isActive ? 'bg-white/10 text-white font-semibold' : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
    }`}
  >
    <button onClick={() => {
        if (navigator.vibrate) navigator.vibrate(5);
        onSelect();
    }} className="flex-grow text-left px-3 py-1.5 text-sm truncate" aria-current={isActive}>
      {session.conversation.title}
    </button>
    <button
      onClick={(e) => {
          e.stopPropagation();
          if (navigator.vibrate) navigator.vibrate(5);
          onClose();
      }}
      aria-label={`Close tab: ${session.conversation.title}`}
      className="flex-shrink-0 p-1 mr-2 rounded-full text-[var(--text-muted)] hover:bg-white/20"
    >
      <CloseIcon />
    </button>
  </div>
);


export const Header: React.FC<HeaderProps> = ({ sessions, activeSessionId, onSelectTab, onCloseTab, onNewTab, onShowHistory, currentView }) => {
  const [isSideDeckOpen, setIsSideDeckOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isSideDeckOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isSideDeckOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSideDeckOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsSideDeckOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full p-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between h-10">
          {currentView === 'chat' && (
            <>
              <div className="font-poppins text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                Orvantaa
              </div>
              <button 
                onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(5);
                    setIsSideDeckOpen(true);
                }}
                className="flex items-center justify-center w-10 h-10 rounded-md transition-colors text-white/80 hover:text-white hover:bg-white/10"
                aria-haspopup="true"
                aria-expanded={isSideDeckOpen}
                aria-controls="sidedeck-menu"
                aria-label="Open profile and settings"
              >
                <ProfileIcon />
              </button>
            </>
          )}
        </nav>
      </header>
      
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ease-in-out ${isSideDeckOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidedeck-title"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSideDeckOpen(false)}></div>

        <div
          id="sidedeck-menu"
          className={`relative z-10 flex flex-col w-full max-w-xs h-full bg-[var(--bg-popover)] ml-auto shadow-2xl shadow-black/50 border-l border-white/10 transition-transform duration-300 ease-in-out transform ${isSideDeckOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)] flex-shrink-0">
            <h2 id="sidedeck-title" className="font-poppins text-xl font-bold text-[var(--text-main)]">Profile & Settings</h2>
            <button
              onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(5);
                  setIsSideDeckOpen(false);
              }}
              className="p-2 rounded-full text-[var(--text-muted)] hover:bg-white/10"
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex-grow p-2 overflow-y-auto no-scrollbar">
            <div className="p-1">
              <DropdownMenuItem icon={<PlusIcon />} label="New Chat" onClick={() => handleAction(onNewTab)} />
            </div>

            {sessions.length > 0 && (
              <div className="px-1 pt-2 pb-1 my-1 border-y border-[var(--border-primary)]">
                  <h3 className="px-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Open Chats</h3>
                  <div className="mt-2 flex flex-col gap-1 max-h-[40vh] overflow-y-auto no-scrollbar p-1">
                      {sessions.map(session => (
                          <TabMenuItem
                              key={session.id} session={session} isActive={session.id === activeSessionId}
                              onSelect={() => handleAction(() => onSelectTab(session.id))}
                              onClose={() => onCloseTab(session.id)}
                          />
                      ))}
                  </div>
              </div>
            )}
            
            <div className="p-1">
              <DropdownMenuItem icon={<HistoryIcon />} label="Conversation History" onClick={() => handleAction(onShowHistory)} />
              <div className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md text-[var(--text-secondary)]">
                <div className="flex items-center gap-3">
                  {isDarkMode ? <MoonIcon/> : <SunIcon/>}
                  <span>Theme</span>
                </div>
                <div className="relative">
                    <button onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(5);
                        setIsDarkMode(!isDarkMode);
                    }} className="w-12 h-6 rounded-full bg-white/10 flex items-center p-1 transition-colors">
                        <span className={`block w-4 h-4 rounded-full bg-white shadow-lg transform transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};