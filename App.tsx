

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Orb } from './components/Orb.tsx';
import { SearchBar } from './components/SearchBar.tsx';
import { SuggestedPrompts } from './components/SuggestedPrompts.tsx';
import { ExploreView } from './components/ExploreView.tsx';
import { CourseDetailView } from './components/DiscoverView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import { QuizzesView } from './components/QuizzesView.tsx';
import { LiveConversationView } from './components/LiveConversationView.tsx';
import { UserIcon, AiSparkleIcon, HomeIcon, SubjectsIcon, OracleIcon, QuizzesIcon, ProfileIcon, MenuIcon, CloseIcon, TrashIcon, HistoryIcon, ChevronLeftIcon } from './components/icons/Icons.tsx';

import { askOrvantaStream, generateFollowUpQuestions, summarizeAndTagConversation, findRelevantConversations } from './services/geminiService.ts';
import { loadHistory, saveHistory } from './services/historyService.ts';
import { useSpeechRecognition } from './useSpeechRecognition.ts';
import { ChatSession, Interaction, Conversation, Course } from './types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type View = 'chat' | 'explore' | 'history' | 'quizzes' | 'subjects' | 'profile';

// --- History Sidebar Components ---
const HistoryItem: React.FC<{
  conversation: Conversation;
  onLoad: () => void;
  onDelete: () => void;
}> = ({ conversation, onLoad, onDelete }) => (
  <div className="flex items-center group w-full rounded-md transition-colors text-[var(--text-secondary)] hover:bg-white/5 hover:text-white">
    <button
      onClick={() => {
        if (navigator.vibrate) navigator.vibrate(5);
        onLoad();
      }}
      className="flex-grow text-left px-3 py-2 text-sm truncate"
    >
      {conversation.title}
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (navigator.vibrate) navigator.vibrate(5);
        onDelete();
      }}
      aria-label={`Delete conversation: ${conversation.title}`}
      className="flex-shrink-0 p-2 mr-2 rounded-full text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-opacity"
    >
      <TrashIcon />
    </button>
  </div>
);

const HistorySidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  history: Conversation[];
  onLoad: (conversation: Conversation) => void;
  onDelete: (id: string) => void;
}> = ({ isOpen, onClose, history, onLoad, onDelete }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-sidebar-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div
        id="history-sidebar-menu"
        className={`relative z-10 flex flex-col w-full max-w-sm h-full bg-[var(--bg-popover)] ml-auto shadow-2xl shadow-black/50 border-l border-white/10 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)] flex-shrink-0">
          <h2 id="history-sidebar-title" className="font-poppins text-xl font-bold text-[var(--text-main)]">History</h2>
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(5);
              onClose();
            }}
            className="p-2 rounded-full text-[var(--text-muted)] hover:bg-white/10"
            aria-label="Close history"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-grow p-2 overflow-y-auto no-scrollbar">
          {history.length > 0 ? (
            <div className="flex flex-col gap-1 p-1">
              {history.map(conv => (
                <HistoryItem
                  key={conv.id}
                  conversation={conv}
                  onLoad={() => onLoad(conv)}
                  onDelete={() => onDelete(conv.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text-secondary)] p-4">
               <div className="p-4 bg-white/5 rounded-full mb-4 ring-1 ring-white/10">
                    <HistoryIcon width={32} height={32} />
               </div>
              <p className="font-semibold text-white">No History Yet</p>
              <p className="text-sm">Your past conversations will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// A simple typewriter component for the streaming response
const Typewriter: React.FC<{ text: string }> = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        // This effect creates the typewriter behavior.
        // It's recursive via its dependency on `displayedText`.
        if (displayedText.length < text.length) {
            const timeoutId = setTimeout(() => {
                setDisplayedText(text.slice(0, displayedText.length + 1));
            }, 25); // Adjust typing speed here (in milliseconds)
            return () => clearTimeout(timeoutId);
        }
    }, [text, displayedText]);

    // Add a blinking cursor at the end while typing for better UX
    const cursor = displayedText.length < text.length ? '▋' : '';
    
    // Use react-markdown to render the text, preserving formatting from Gemini
    // Add a zero-width space if empty to prevent layout collapse.
    return <Markdown remarkPlugins={[remarkGfm]}>{(displayedText + cursor) || '​'}</Markdown>;
};


const PlaceholderView: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in p-4 text-[var(--text-secondary)]">
        <div className="p-4 bg-[var(--bg-secondary)] text-white rounded-full mb-6 ring-2 ring-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            {icon}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            {title}
        </h1>
        <p className="text-sm md:text-base mt-2 tracking-tight">
            {description}
        </p>
        <p className="mt-6 px-4 py-2 text-sm font-semibold bg-[var(--bg-secondary)] text-white/70 rounded-full border border-white/10">
            Coming Soon
        </p>
    </div>
);

const ProfileView: React.FC = () => (
    <div className="w-full max-w-7xl mx-auto animate-fade-in p-4 pt-8 text-center">
         <div className="inline-block p-4 bg-[var(--bg-secondary)] text-white rounded-full mb-6 ring-2 ring-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <ProfileIcon width={64} height={64} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Tasya's Profile
        </h1>
        <p className="text-sm md:text-base mt-2 tracking-tight text-[var(--text-secondary)]">
            Welcome back to your learning dashboard.
        </p>
         <div className="mt-8 grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="bg-[var(--bg-secondary)] p-4 rounded-xl">
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-[var(--text-muted)]">Courses Started</p>
            </div>
            <div className="bg-[var(--bg-secondary)] p-4 rounded-xl">
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-[var(--text-muted)]">Quizzes Completed</p>
            </div>
        </div>

        <div className="mt-12 max-w-sm mx-auto text-left">
             <h2 className="text-lg font-bold text-white mb-4">Settings</h2>
              <div className="bg-[var(--bg-secondary)] p-4 rounded-xl">
                 <button className="w-full text-left py-2 text-red-400 font-semibold">
                    Log Out
                 </button>
              </div>
        </div>
    </div>
);


const NavButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ label, isActive, onClick, children }) => (
    <button
        onClick={() => {
            if (navigator.vibrate) {
                navigator.vibrate(5); // Subtle haptic feedback
            }
            onClick();
        }}
        aria-label={label}
        className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full transition-colors duration-400 ease-[cubic-bezier(0.65,0,0.35,1)] group ${isActive ? 'text-black' : 'text-gray-400 hover:text-white'}`}
    >
        <div className={`transition-transform duration-400 ease-[cubic-bezier(0.65,0,0.35,1)] ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
            {children}
        </div>
    </button>
);


const App: React.FC = () => {
    const [hasOnboarded, setHasOnboarded] = useState(() => localStorage.getItem('orvanta-onboarded') === 'true');
    const [view, setView] = useState<View>('chat');
    
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [history, setHistory] = useState<Conversation[]>([]);
    
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);

    const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();
    const conversationEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setHistory(loadHistory());
        // Start with a new chat session on initial load
        handleNewTab();
    }, []);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [sessions, activeSessionId]);
    
    useEffect(() => {
        if (transcript) {
            setQuery(transcript);
        }
    }, [transcript]);

    const handleImageSelect = (base64: string) => {
        setSelectedImage(base64);
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
    };

    const handleCameraClick = () => {
        // Placeholder for camera functionality
        console.log('Camera clicked. Implementation pending.');
        alert('Camera functionality is coming soon!');
    };
    
    const handleSearch = async (searchQuery: string, image?: string | null) => {
        const finalImage = image || selectedImage;
        if (!searchQuery.trim() && !finalImage) return;

        let currentSessionId = activeSessionId;

        if (!currentSessionId) {
            const newSession = createNewSession();
            setSessions(prev => [newSession, ...prev]);
            setActiveSessionId(newSession.id);
            currentSessionId = newSession.id;
            setView('chat'); 
        }
        
        const userInteraction: Interaction = { 
            query: searchQuery, 
            response: '', 
            isLoading: true,
            image: finalImage,
        };

        setSessions(prev => prev.map(s => 
            s.id === currentSessionId 
                ? { ...s, conversation: { ...s.conversation, interactions: [...s.conversation.interactions, userInteraction] } }
                : s
        ));
        
        setIsLoading(true);
        setError(null);
        setQuery('');
        setSelectedImage(null);

        try {
            let fullResponse = '';
            const stream = askOrvantaStream(searchQuery, finalImage);

            for await (const chunk of stream) {
                fullResponse += chunk;
                setSessions(prevSessions => prevSessions.map(s => {
                    if (s.id !== currentSessionId) return s;
                    
                    const newInteractions = [...s.conversation.interactions];
                    const lastInteractionIndex = newInteractions.length - 1;
                    
                    if (lastInteractionIndex >= 0) {
                        newInteractions[lastInteractionIndex] = {
                            ...newInteractions[lastInteractionIndex],
                            response: fullResponse
                        };
                    }
                    
                    return { ...s, conversation: { ...s.conversation, interactions: newInteractions } };
                }));
            }
            
            if (navigator.vibrate) {
                navigator.vibrate([5, 50, 5]); // Success feedback
            }

            const followUps = await generateFollowUpQuestions({ query: searchQuery, response: fullResponse, image: finalImage });

            updateSession(currentSessionId, (conv) => {
                const newInteractions = [...conv.interactions];
                const lastInteractionIndex = newInteractions.length - 1;
                if (lastInteractionIndex >= 0) {
                     newInteractions[lastInteractionIndex] = {
                        ...newInteractions[lastInteractionIndex],
                        response: fullResponse,
                        followUpPrompts: followUps, 
                        isLoading: false, 
                    };
                }
                return { ...conv, interactions: newInteractions };
            });
            
        } catch (err: any) {
            if (navigator.vibrate) {
                navigator.vibrate([75, 50, 75]); // Error feedback
            }
            setError(err.message || 'Something went wrong.');
            updateSession(currentSessionId, (conv) => {
                const newInteractions = [...conv.interactions];
                const lastInteractionIndex = newInteractions.length - 1;
                if (lastInteractionIndex >= 0) {
                     newInteractions[lastInteractionIndex] = {
                        ...newInteractions[lastInteractionIndex],
                        response: err.message || "An unknown error occurred.", 
                        isLoading: false,
                    };
                }
                return { ...conv, interactions: newInteractions };
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const updateSession = (sessionId: string, updateFn: (conversation: Conversation) => Conversation) => {
        setSessions(prevSessions => {
            const newSessions = prevSessions.map(s => {
                if (s.id === sessionId) {
                    const updatedConversation = updateFn(s.conversation);
                    return { ...s, conversation: updatedConversation };
                }
                return s;
            });
            
            const updatedSession = newSessions.find(s => s.id === sessionId);
            // Auto-save logic can be adjusted or removed if manual saving is preferred
            if (updatedSession && updatedSession.conversation.interactions.length > 0 && updatedSession.conversation.interactions.length % 5 === 0) {
                saveConversationToHistory(updatedSession.conversation);
            }
            
            return newSessions;
        });
    };

    const saveConversationToHistory = async (conversation: Conversation) => {
        if (conversation.interactions.length === 0) return;

        const { title, tags } = await summarizeAndTagConversation(conversation.interactions);
        
        const updatedConversation: Conversation = {
            ...conversation,
            title: title || conversation.interactions[0].query || "Untitled Chat",
            tags: tags || [],
            updatedAt: Date.now(),
        };

        setHistory(prevHistory => {
            const existingIndex = prevHistory.findIndex(c => c.id === conversation.id);
            let newHistory;
            if (existingIndex > -1) {
                newHistory = [...prevHistory];
                newHistory[existingIndex] = updatedConversation;
            } else {
                newHistory = [updatedConversation, ...prevHistory];
            }
            saveHistory(newHistory);
            return newHistory;
        });
    };
    
    const createNewSession = (): ChatSession => {
        const newId = uuidv4();
        return {
            id: newId,
            conversation: {
                id: newId,
                title: 'New Chat',
                interactions: [],
                tags: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        };
    };

    const handleNewTab = () => {
        const newSession = createNewSession();
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setView('chat');
    };
    
    const handleChatNavClick = () => {
        setSelectedCourse(null);
        
        // Find the current active session before creating a new one.
        const currentActiveSession = sessions.find(s => s.id === activeSessionId);

        // If there's an active session with content, save it to history.
        if (currentActiveSession && currentActiveSession.conversation.interactions.length > 0) {
            saveConversationToHistory(currentActiveSession.conversation);
        }
        
        // Always start a new chat session when the nav button is clicked.
        handleNewTab();
    };


    const handleSelectTab = (id: string) => {
        setActiveSessionId(id);
        setView('chat');
    };

    const handleCloseTab = (id: string) => {
        const sessionToClose = sessions.find(s => s.id === id);
        if (sessionToClose && sessionToClose.conversation.interactions.length > 0) {
            saveConversationToHistory(sessionToClose.conversation);
        }
        
        const remainingSessions = sessions.filter(s => s.id !== id);
        setSessions(remainingSessions);
        
        if (activeSessionId === id) {
            if (remainingSessions.length > 0) {
                setActiveSessionId(remainingSessions[0].id);
            } else {
                setActiveSessionId(null);
                setView('explore');
            }
        }
    };
    
    const handleShowHistory = () => {
        setSelectedCourse(null);
        setView('history');
    }

    const handleLoadConversation = (conversation: Conversation) => {
        const existingSession = sessions.find(s => s.id === conversation.id);
        if (existingSession) {
            // If the session is already open, just make it active.
            setActiveSessionId(conversation.id);
        } else {
            // If not open, add it to the sessions list and make it active.
            setSessions(prev => [{ id: conversation.id, conversation }, ...prev]);
            setActiveSessionId(conversation.id);
        }
        setSelectedCourse(null);
        setView('chat');
    };

    const handleDeleteConversation = (id: string) => {
        setHistory(prev => {
            const newHistory = prev.filter(c => c.id !== id);
            saveHistory(newHistory);
            return newHistory;
        });
        setSessions(prev => prev.filter(s => s.id !== id));
        if (activeSessionId === id) {
             // If the deleted conversation was active, create a new chat.
             handleNewTab();
        }
    };

    const handleSetView = (newView: View) => {
        setSelectedCourse(null);
        setView(newView);
    };

    const handleLiveConversationComplete = (transcript: { user: string; ai: string }) => {
        let currentSessionId = activeSessionId;
        if (!currentSessionId) {
            const newSession = createNewSession();
            setSessions(prev => [newSession, ...prev]);
            setActiveSessionId(newSession.id);
            currentSessionId = newSession.id;
        }

        if (!transcript.user.trim() && !transcript.ai.trim()) {
            return;
        }

        const interaction: Interaction = {
            query: `(Voice) ${transcript.user.trim() || '...'}`,
            response: transcript.ai.trim(),
            isLoading: false,
        };

        updateSession(currentSessionId, (conv) => ({
            ...conv,
            interactions: [...conv.interactions, interaction],
        }));
    };
    
    const activeSession = sessions.find(s => s.id === activeSessionId);

    const renderChatView = () => {
        const hasInteractions = activeSession && activeSession.conversation.interactions.length > 0;

        return isLiveMode ? (
            <LiveConversationView 
                onClose={() => setIsLiveMode(false)}
                onComplete={handleLiveConversationComplete}
            />
        ) : (
        <div className="h-full w-full flex flex-col bg-white text-gray-900">
            <HistorySidebar
                isOpen={isHistorySidebarOpen}
                onClose={() => setIsHistorySidebarOpen(false)}
                history={history}
                onLoad={(conv) => {
                    handleLoadConversation(conv);
                    setIsHistorySidebarOpen(false);
                }}
                onDelete={handleDeleteConversation}
            />
            <header className="fixed top-0 left-0 right-0 z-30 px-2 py-2 flex justify-between items-center bg-white/75 backdrop-blur-sm border-b border-gray-200">
                <button 
                    className="flex items-center gap-1 text-gray-900 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                    aria-label="Go back to Home"
                    onClick={() => handleSetView('explore')}
                >
                    <ChevronLeftIcon />
                    <span className="font-semibold text-lg" style={{marginTop: '1px'}}>Home</span>
                </button>
                <button 
                    className="p-2 rounded-full text-gray-900 hover:bg-gray-100"
                    aria-label="Open History"
                    onClick={() => setIsHistorySidebarOpen(true)}
                >
                    <MenuIcon />
                </button>
            </header>

            <main className={`flex-grow w-full max-w-4xl mx-auto px-4 ${
                hasInteractions
                ? 'overflow-y-auto no-scrollbar pt-20 pb-28'
                : 'flex flex-col items-center justify-center'
            }`}>
                {!hasInteractions ? (
                    <div className="text-center text-gray-500 animate-fade-in">
                        
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {activeSession.conversation.interactions.map((interaction, index) => {
                            const isLastInteraction = index === activeSession.conversation.interactions.length - 1;
                            return (
                                <div key={index} className="flex flex-col gap-6">
                                    {/* User question bubble */}
                                    {(interaction.query || interaction.image) && (
                                        <div className="flex justify-end w-full">
                                            <div className="bg-[var(--bg-secondary)] rounded-2xl py-3 px-4 max-w-lg text-white">
                                                {interaction.image && (
                                                    <img src={interaction.image} alt="User upload" className="mb-2 rounded-lg max-w-xs max-h-48 object-cover" />
                                                )}
                                                {interaction.query && (
                                                   <p>{interaction.query}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* AI response text with typewriter effect */}
                                    {(interaction.response || (isLastInteraction && interaction.isLoading)) ? (
                                        <div className="max-w-none prose prose-neutral">
                                            {isLastInteraction ? (
                                                <Typewriter text={interaction.response} />
                                            ) : (
                                                <Markdown remarkPlugins={[remarkGfm]}>{interaction.response}</Markdown>
                                            )}
                                            
                                            {/* Show follow-up prompts only after the last message is completely loaded */}
                                            {isLastInteraction && !interaction.isLoading && interaction.followUpPrompts && interaction.followUpPrompts.length > 0 && (
                                                <div className="mt-6">
                                                    <SuggestedPrompts 
                                                        prompts={interaction.followUpPrompts} 
                                                        onPromptSelect={(prompt) => handleSearch(prompt)} 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : null }
                                </div>
                            )
                        })}
                        <div ref={conversationEndRef} />
                    </div>
                )}
            </main>

            <div className="fixed bottom-2 left-0 right-0 z-40 flex justify-center p-4">
                <SearchBar 
                    onSearch={handleSearch}
                    query={query}
                    setQuery={setQuery}
                    isLoading={isLoading}
                    selectedImage={selectedImage}
                    onImageSelect={handleImageSelect}
                    onRemoveImage={handleRemoveImage}
                    onCameraClick={handleCameraClick}
                    isListening={isListening}
                    startListening={startListening}
                    stopListening={stopListening}
                    hasRecognitionSupport={hasRecognitionSupport}
                />
            </div>
        </div>
    )};

    const renderMainContent = () => {
        if (selectedCourse) {
            return <CourseDetailView course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
        }
        
        switch (view) {
            case 'explore':
                return <ExploreView onCourseSelect={(course) => setSelectedCourse(course)} />;
            case 'history':
                return <HistoryView 
                            history={history} 
                            onLoad={handleLoadConversation} 
                            onDelete={handleDeleteConversation} 
                            onSearch={(term) => findRelevantConversations(term, history)}
                        />;
            case 'quizzes':
                return <QuizzesView />;
            case 'subjects':
                return <PlaceholderView title="Subjects" description="Dive deep into curated topics and learning paths." icon={<SubjectsIcon width={48} height={48} />} />;
            case 'profile':
                return <ProfileView />;
            case 'chat':
            default:
                return renderChatView();
        }
    };

    if (!hasOnboarded) {
        return <Onboarding onComplete={() => {
            localStorage.setItem('orvanta-onboarded', 'true');
            setHasOnboarded(true);
        }} />;
    }
    
    const navItems = [
        { id: 'explore', label: 'Home', icon: <HomeIcon />, action: () => handleSetView('explore') },
        { id: 'subjects', label: 'Subjects', icon: <SubjectsIcon />, action: () => handleSetView('subjects') },
        { id: 'chat', label: 'Chat', icon: <OracleIcon />, action: handleChatNavClick },
        { id: 'quizzes', label: 'Quizzes', icon: <QuizzesIcon />, action: () => handleSetView('quizzes') },
        { id: 'profile', label: 'Profile', icon: <ProfileIcon />, action: () => handleSetView('profile') },
    ];

    const activeNavIndex = navItems.findIndex(item => item.id === view);

    return (
        <div className={`min-h-screen w-full flex flex-col transition-colors duration-300 ${view === 'chat' ? 'bg-white' : view === 'explore' ? 'bg-gray-50' : 'bg-[var(--bg-main)]'}`}>
            <div className={`flex-grow ${view !== 'chat' ? 'pb-28' : ''}`}>
                {renderMainContent()}
            </div>
            
            { !selectedCourse && !isLiveMode && view !== 'chat' && (
                <>
                    <div
                        aria-hidden="true"
                        className="pointer-events-none fixed bottom-0 left-0 right-0 h-48 z-40"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-t to-transparent ${view === 'chat' ? 'from-white via-white/90' : 'from-[var(--bg-main)] via-[var(--bg-main)]/90'}`}></div>
                        <div
                            className="absolute bottom-[-50px] left-1/2 w-[150%] max-w-4xl h-[100px] bg-gradient-to-r from-[var(--orb-gradient-from)] via-[var(--orb-gradient-via)] to-[var(--orb-gradient-to)] animate-slow-pulse blur-[120px]"
                        />
                    </div>

                    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50">
                        <div className="relative flex items-center justify-center gap-2 p-1">
                            {activeNavIndex !== -1 && (
                                <div
                                    className="absolute top-1 left-1 h-16 w-16 bg-white rounded-full transition-transform duration-400 ease-[cubic-bezier(0.65,0,0.35,1)] animate-pulse-shadow"
                                    style={{ transform: `translateX(calc(${activeNavIndex} * (4rem + 0.5rem)))` }} // w-16 (4rem) + gap-2 (0.5rem)
                                />
                            )}
                            {navItems.map(item => (
                                <NavButton
                                    key={item.id}
                                    label={item.label}
                                    isActive={view === item.id}
                                    onClick={item.action}
                                >
                                    {item.icon}
                                </NavButton>
                            ))}
                        </div>
                    </nav>
                </>
            )}
        </div>
    );
};

export default App;