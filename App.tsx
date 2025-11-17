
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Orb } from './components/Orb.tsx';
import { SearchBar } from './components/SearchBar.tsx';
import { ExploreView } from './components/ExploreView.tsx';
import { CourseDetailView } from './components/DiscoverView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import { QuizzesView } from './components/QuizzesView.tsx';
import { LiveConversationView } from './components/LiveConversationView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { UserIcon, AiSparkleIcon, HomeIcon, SubjectsIcon, OracleIcon, QuizzesIcon, ProfileIcon, MenuIcon, CloseIcon, TrashIcon, HistoryIcon, ChevronLeftIcon, HomeIconFilled, SubjectsIconFilled, OracleIconFilled, QuizzesIconFilled, ProfileIconFilled } from './components/icons/Icons.tsx';

import { askOrvantaStream, summarizeAndTagConversation, findRelevantConversations } from './services/geminiService.ts';
import { loadHistory, saveHistory } from './services/historyService.ts';
import { useSpeechRecognition } from './useSpeechRecognition.ts';
import { Interaction, Conversation, Course } from './types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type View = 'chat' | 'explore' | 'history' | 'quizzes' | 'subjects' | 'profile';

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


const NavButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
}> = ({ label, isActive, onClick, icon, activeIcon }) => {
    return (
        <button
            onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                onClick();
            }}
            aria-label={label}
            className="group relative flex items-center justify-center w-16 h-full text-black transition-transform duration-150 ease-out active:scale-90"
        >
            {/* Outline icon - visible when not active. Crossfades with filled icon. */}
            <div
                aria-hidden="true"
                className={`
                    absolute transition-opacity duration-300 ease-in-out
                    ${isActive ? 'opacity-0' : 'opacity-70 group-hover:opacity-100'}
                `}
            >
                {icon}
            </div>

            {/* Filled icon - visible when active. Crossfades with outline icon. */}
            <div
                aria-hidden="true"
                className={`
                    absolute transition-opacity duration-300 ease-in-out
                    ${isActive ? 'opacity-100' : 'opacity-0'}
                `}
            >
                {activeIcon}
            </div>
        </button>
    );
};


const App: React.FC = () => {
    const [hasOnboarded, setHasOnboarded] = useState(() => localStorage.getItem('orvanta-onboarded') === 'true');
    const [view, setView] = useState<View>('explore');
    
    const createNewConversation = (): Conversation => ({
        id: uuidv4(),
        title: 'New Chat',
        interactions: [],
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });

    const [conversation, setConversation] = useState<Conversation>(createNewConversation());
    const [history, setHistory] = useState<Conversation[]>([]);
    
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [useWebSearch, setUseWebSearch] = useState(false);
    
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isLiveMode, setIsLiveMode] = useState(false);

    const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();
    const conversationEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setHistory(loadHistory());
    }, []);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);
    
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
        
        setView('chat'); 

        const userInteraction: Interaction = { 
            query: searchQuery, 
            response: '', 
            isLoading: true,
            image: finalImage,
        };

        setConversation(prev => ({
            ...prev,
            interactions: [...prev.interactions, userInteraction],
        }));
        
        setIsLoading(true);
        setError(null);
        setQuery('');
        setSelectedImage(null);

        try {
            let fullResponse = '';
            let fullSources: { uri: string, title: string }[] | undefined = undefined;
            const stream = askOrvantaStream(searchQuery, finalImage, useWebSearch);

            for await (const chunk of stream) {
                if (chunk.text) {
                    fullResponse += chunk.text;
                }
                if (chunk.sources) {
                    fullSources = chunk.sources;
                }

                setConversation(prevConv => {
                    const newInteractions = [...prevConv.interactions];
                    const lastInteractionIndex = newInteractions.length - 1;
                    if (lastInteractionIndex >= 0) {
                        newInteractions[lastInteractionIndex] = {
                            ...newInteractions[lastInteractionIndex],
                            response: fullResponse,
                            sources: fullSources,
                        };
                    }
                    return { ...prevConv, interactions: newInteractions };
                });
            }
            
            if (navigator.vibrate) {
                navigator.vibrate([5, 50, 5]);
            }

            setConversation(prevConv => {
                const newInteractions = [...prevConv.interactions];
                const lastInteractionIndex = newInteractions.length - 1;
                if (lastInteractionIndex >= 0) {
                     newInteractions[lastInteractionIndex] = {
                        ...newInteractions[lastInteractionIndex],
                        response: fullResponse,
                        sources: fullSources,
                        isLoading: false, 
                    };
                }
                const updatedConv = { ...prevConv, interactions: newInteractions };
                
                // Auto-save logic
                if (updatedConv.interactions.length > 0 && updatedConv.interactions.length % 5 === 0) {
                    saveConversationToHistory(updatedConv);
                }

                return updatedConv;
            });
            
        } catch (err: any) {
            if (navigator.vibrate) {
                navigator.vibrate([75, 50, 75]); // Error feedback
            }
            setError(err.message || 'Something went wrong.');
            setConversation(prevConv => {
                const newInteractions = [...prevConv.interactions];
                const lastInteractionIndex = newInteractions.length - 1;
                if (lastInteractionIndex >= 0) {
                     newInteractions[lastInteractionIndex] = {
                        ...newInteractions[lastInteractionIndex],
                        response: err.message || "An unknown error occurred.", 
                        isLoading: false,
                    };
                }
                return { ...prevConv, interactions: newInteractions };
            });
        } finally {
            setIsLoading(false);
        }
    };

    const saveConversationToHistory = async (conv: Conversation) => {
        if (conv.interactions.length === 0) return;

        const { title, tags } = await summarizeAndTagConversation(conv.interactions);
        
        const updatedConversation: Conversation = {
            ...conv,
            title: title || conv.interactions[0].query || "Untitled Chat",
            tags: tags || [],
            updatedAt: Date.now(),
        };

        setHistory(prevHistory => {
            const existingIndex = prevHistory.findIndex(c => c.id === conv.id);
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
    
    const handleChatNavClick = () => {
        setSelectedCourse(null);
        
        if (conversation.interactions.length > 0) {
            saveConversationToHistory(conversation);
        }
        
        setConversation(createNewConversation());
        setView('chat');
    };
    
    const handleShowHistory = () => {
        setSelectedCourse(null);
        setView('history');
    }

    const handleLoadConversation = (conversationToLoad: Conversation) => {
        // Save the current one if it's not empty and not the one we are about to load
        if (conversation.interactions.length > 0 && conversation.id !== conversationToLoad.id) {
            saveConversationToHistory(conversation);
        }
        setConversation(conversationToLoad);
        setSelectedCourse(null);
        setView('chat');
    };

    const handleDeleteConversation = (id: string) => {
        setHistory(prev => {
            const newHistory = prev.filter(c => c.id !== id);
            saveHistory(newHistory);
            return newHistory;
        });
        if (conversation.id === id) {
             setConversation(createNewConversation());
        }
    };

    const handleSetView = (newView: View) => {
        setSelectedCourse(null);
        // Save conversation when navigating away from chat view
        if (view === 'chat' && newView !== 'chat' && conversation.interactions.length > 0) {
             saveConversationToHistory(conversation);
        }
        setView(newView);
    };

    const handleLiveConversationComplete = (transcript: { user: string; ai: string }) => {
        if (!transcript.user.trim() && !transcript.ai.trim()) {
            return;
        }

        const interaction: Interaction = {
            query: `(Voice) ${transcript.user.trim() || '...'}`,
            response: transcript.ai.trim(),
            isLoading: false,
        };

        setConversation(prev => ({
            ...prev,
            interactions: [...prev.interactions, interaction]
        }));
    };
    
    const renderChatView = () => {
        return isLiveMode ? (
            <LiveConversationView 
                onClose={() => setIsLiveMode(false)}
                onComplete={handleLiveConversationComplete}
            />
        ) : (
        <div className="h-full w-full flex flex-col bg-white text-black">
             <header className="fixed top-0 left-0 right-0 z-30 px-4 py-3 flex justify-between items-center bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <button onClick={() => handleSetView('explore')} className="flex items-center gap-1 text-gray-800 font-semibold text-lg">
                    <ChevronLeftIcon />
                    <span>Home</span>
                </button>

                <button 
                    className="p-2 rounded-full text-gray-800 hover:bg-gray-200"
                    aria-label="Menu"
                >
                    <MenuIcon />
                </button>
            </header>

            <main className="flex-grow w-full max-w-4xl mx-auto px-4 overflow-y-auto no-scrollbar pt-24 pb-40">
                <div className="flex flex-col gap-4">
                    {/* Static Welcome Message */}
                    <div className="flex justify-start w-full animate-fade-in">
                        <div className="bg-gray-100 rounded-2xl rounded-bl-lg py-3 px-4 max-w-lg text-gray-800">
                           <p>Hello! 👋 How can I help you study today? 🧠</p>
                        </div>
                    </div>

                    {/* Dynamic Conversation */}
                    {conversation.interactions.map((interaction, index) => {
                        const isLastInteraction = index === conversation.interactions.length - 1;
                        return (
                            <div key={index} className="flex flex-col gap-4">
                                {/* User question bubble */}
                                {(interaction.query || interaction.image) && (
                                    <div className="flex justify-end w-full">
                                        <div className="bg-black rounded-2xl py-3 px-4 max-w-lg text-white">
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
                                    <div className="flex justify-start w-full">
                                        <div className="bg-gray-100 rounded-2xl rounded-bl-lg py-3 px-4 max-w-lg text-gray-800 prose prose-p:my-0 prose-strong:text-black">
                                            {isLastInteraction && interaction.isLoading ? (
                                                <Typewriter text={interaction.response} />
                                            ) : (
                                                <Markdown remarkPlugins={[remarkGfm]}>{interaction.response}</Markdown>
                                            )}
                                        </div>
                                    </div>
                                ) : null }
                            </div>
                        )
                    })}
                    <div ref={conversationEndRef} />
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center p-4 bg-gradient-to-t from-white via-white to-transparent">
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
                    useWebSearch={useWebSearch}
                    onWebSearchChange={setUseWebSearch}
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
                return <ExploreView onCourseSelect={(course) => setSelectedCourse(course)} onNewChat={handleChatNavClick}/>;
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
        { id: 'explore', label: 'Home', icon: <HomeIcon />, activeIcon: <HomeIconFilled />, action: () => handleSetView('explore') },
        { id: 'subjects', label: 'Subjects', icon: <SubjectsIcon />, activeIcon: <SubjectsIconFilled />, action: () => handleSetView('subjects') },
        { id: 'chat', label: 'Chat', icon: <OracleIcon />, activeIcon: <OracleIconFilled />, action: () => handleSetView('chat') },
        { id: 'quizzes', label: 'Quizzes', icon: <QuizzesIcon />, activeIcon: <QuizzesIconFilled />, action: () => handleSetView('quizzes') },
        { id: 'profile', label: 'Profile', icon: <ProfileIcon />, activeIcon: <ProfileIconFilled />, action: () => handleSetView('profile') },
    ];

    return (
        <div className={`min-h-screen w-full flex flex-col transition-colors duration-300 ${view === 'chat' ? 'bg-white' : 'bg-[var(--bg-main)]'}`}>
            <div className={`flex-grow ${view !== 'chat' ? 'pb-24' : ''}`}>
                {renderMainContent()}
            </div>
            
            { !selectedCourse && !isLiveMode && view !== 'chat' && (
                <>
                    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-t border-white/10" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                        <div className="flex justify-around items-center h-[60px] text-white">
                            {navItems.map(item => (
                                <NavButton
                                    key={item.id}
                                    label={item.label}
                                    isActive={view === item.id}
                                    onClick={item.action}
                                    icon={item.icon}
                                    activeIcon={item.activeIcon}
                                />
                            ))}
                        </div>
                    </nav>
                </>
            )}
        </div>
    );
};

export default App;