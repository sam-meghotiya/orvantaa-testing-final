
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getUser } from '../services/userService.ts';
import { 
    AtomIcon, BeakerIcon, DnaIcon, CalculatorIcon, 
    GlobeIcon, BookOpenIcon, TranslationIcon, PaletteIcon, 
    BankIcon, TrendingUpIcon, CompassIcon, HistoryIcon,
    ChevronLeftIcon, CheckIcon, AiSparkleIcon, FilterIcon
} from './icons/Icons.tsx';
import Markdown from 'react-markdown';

// --- Data & Types ---

type Subject = {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';
    stream?: 'Science' | 'Commerce' | 'Arts';
};

type ClassData = {
    id: string;
    label: string;
    subjects: Subject[];
};

// iOS inspired color palette
const iconColors = {
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    purple: 'text-violet-400',
    orange: 'text-orange-400',
    red: 'text-rose-400',
    teal: 'text-teal-400'
};

const bgGradients = {
    blue: 'bg-gradient-to-br from-[#0A3A6E] to-[#101012]',
    green: 'bg-gradient-to-br from-[#1A4D2A] to-[#101012]',
    purple: 'bg-gradient-to-br from-[#4D2A6B] to-[#101012]',
    orange: 'bg-gradient-to-br from-[#663D00] to-[#101012]',
    red: 'bg-gradient-to-br from-[#6E1A2A] to-[#101012]',
    teal: 'bg-gradient-to-br from-[#0D4D4D] to-[#101012]',
};

const shadowColors = {
    blue: 'hover:shadow-blue-900/50',
    green: 'hover:shadow-green-900/50',
    purple: 'hover:shadow-purple-900/50',
    orange: 'hover:shadow-orange-900/50',
    red: 'hover:shadow-red-900/50',
    teal: 'hover:shadow-teal-900/50',
}

const commonSubjects: Subject[] = [
    { id: 'math', name: 'Mathematics', icon: <CalculatorIcon />, color: 'blue' },
    { id: 'sci', name: 'Science', icon: <AtomIcon />, color: 'purple' },
    { id: 'eng', name: 'English', icon: <TranslationIcon />, color: 'red' },
    { id: 'sst', name: 'Social Science', icon: <GlobeIcon />, color: 'orange' },
    { id: 'hindi', name: 'Hindi', icon: <BookOpenIcon />, color: 'green' },
];

// Helper to generate subject data for 6th-10th
const generateStandardSubjects = (): Subject[] => commonSubjects;

const class11_12_Subjects: Subject[] = [
    // Science
    { id: 'phys', name: 'Physics', icon: <AtomIcon />, color: 'blue', stream: 'Science' },
    { id: 'chem', name: 'Chemistry', icon: <BeakerIcon />, color: 'purple', stream: 'Science' },
    { id: 'bio', name: 'Biology', icon: <DnaIcon />, color: 'green', stream: 'Science' },
    { id: 'math_sci', name: 'Mathematics', icon: <CalculatorIcon />, color: 'teal', stream: 'Science' },
    
    // Commerce
    { id: 'acct', name: 'Accountancy', icon: <BankIcon />, color: 'blue', stream: 'Commerce' },
    { id: 'bst', name: 'Business Studies', icon: <TrendingUpIcon />, color: 'orange', stream: 'Commerce' },
    { id: 'econ', name: 'Economics', icon: <CompassIcon />, color: 'purple', stream: 'Commerce' },
    { id: 'math_comm', name: 'Mathematics', icon: <CalculatorIcon />, color: 'teal', stream: 'Commerce' },
    
    // Arts/Humanities
    { id: 'hist', name: 'History', icon: <HistoryIcon />, color: 'orange', stream: 'Arts' },
    { id: 'geo', name: 'Geography', icon: <GlobeIcon />, color: 'green', stream: 'Arts' },
    { id: 'pol', name: 'Political Science', icon: <BankIcon />, color: 'red', stream: 'Arts' },
    { id: 'soc', name: 'Sociology', icon: <PaletteIcon />, color: 'purple', stream: 'Arts' },
    { id: 'eng_core', name: 'English Core', icon: <TranslationIcon />, color: 'blue', stream: 'Arts' },
];

const allClassData: ClassData[] = [
    { id: '6', label: 'Class 6', subjects: generateStandardSubjects() },
    { id: '7', label: 'Class 7', subjects: generateStandardSubjects() },
    { id: '8', label: 'Class 8', subjects: generateStandardSubjects() },
    { id: '9', label: 'Class 9', subjects: generateStandardSubjects() },
    { id: '10', label: 'Class 10', subjects: generateStandardSubjects() },
    { id: '11', label: 'Class 11', subjects: class11_12_Subjects },
    { id: '12', label: 'Class 12', subjects: class11_12_Subjects },
];

// --- Aesthetic Decorations ---

const getSubjectDecoration = (id: string, color: keyof typeof iconColors) => {
    const colorClass = iconColors[color];
    const className = `absolute pointer-events-none ${colorClass} opacity-20`;

    switch (id) {
        case 'math': case 'math_sci': case 'math_comm':
            return (
                <>
                    <div className={`${className} -right-2 bottom-6 text-[8rem] font-serif rotate-12 font-thin italic leading-none`}>∫</div>
                    <div className={`${className} top-2 right-8 text-5xl font-serif rotate-[-15deg]`}>π</div>
                    <div className={`${className} bottom-4 right-16 text-2xl font-mono`}>√x</div>
                </>
            );
        case 'sci': case 'phys':
            return (
                <svg className={`${className} -right-8 -bottom-8 w-48 h-48 animate-spin-slow`} style={{ animationDuration: '60s' }} viewBox="0 0 100 100">
                    <ellipse cx="50" cy="50" rx="40" ry="10" stroke="currentColor" fill="none" strokeWidth="1" transform="rotate(45 50 50)"/>
                    <ellipse cx="50" cy="50" rx="40" ry="10" stroke="currentColor" fill="none" strokeWidth="1" transform="rotate(-45 50 50)"/>
                    <ellipse cx="50" cy="50" rx="40" ry="10" stroke="currentColor" fill="none" strokeWidth="1" />
                    <circle cx="50" cy="50" r="4" fill="currentColor" />
                </svg>
            );
        case 'chem':
            return (
                <svg className={`${className} -right-4 bottom-2 w-32 h-32`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M50 20 L80 35 V65 L50 80 L20 65 V35 Z" />
                    <circle cx="50" cy="50" r="15" />
                    <line x1="50" y1="20" x2="50" y2="35" /><line x1="80" y1="35" x2="65" y2="42" />
                </svg>
            );
        case 'bio':
            return (
                <>
                    <svg className={`${className} -right-6 top-0 h-full w-24`} viewBox="0 0 50 200" preserveAspectRatio="none">
                        <path d="M25,0 Q45,25 25,50 T25,100 T25,150 T25,200" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <div className={`${className} bottom-4 right-16 text-3xl`}>🌿</div>
                </>
            );
        case 'eng': case 'eng_core': case 'hindi':
            return (
                <>
                    <div className={`${className} right-2 bottom-0 text-8xl font-serif leading-none`}>Aa</div>
                    <div className={`${className} top-4 right-6 text-6xl font-serif leading-none`}>”</div>
                </>
            );
        case 'sst': case 'geo':
            return (
                <svg className={`${className} opacity-10 -right-8 -bottom-8 w-48 h-48`} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
                    <path d="M10,50 Q50,20 90,50 Q50,80 10,50" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
            );
        case 'hist': case 'pol': case 'soc':
            return (
                <svg className={`${className} right-0 bottom-0 w-32 h-40`} viewBox="0 0 100 120">
                    <rect x="20" y="10" width="60" height="10" fill="currentColor" /><rect x="25" y="20" width="50" height="80" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
            );
        case 'acct': case 'bst': case 'econ':
            return (
                <div className={`${className} right-4 bottom-4 w-24 h-24 flex items-end justify-end gap-1 text-current opacity-30`}>
                    <div className="w-3 h-8 bg-current rounded-t-sm"></div><div className="w-3 h-12 bg-current rounded-t-sm"></div><div className="w-3 h-16 bg-current rounded-t-sm"></div>
                </div>
            );
        default: return null;
    }
};

// --- Class 6 Content Data ---
// ... (omitted for brevity, no changes from previous turn)
interface ChapterData {
    id: string;
    title: string;
    category?: string;
    summary: string;
    topics: string[];
    definitions: { term: string; def: string }[];
    diagrams: React.ReactNode[];
    importantPoints?: string[];
}
const class6Content: Record<string, ChapterData[]> = {}; // Omitted for brevity

// --- Subject Detail View Component ---
// ... (omitted for brevity, no changes from previous turn)
const SubjectDetailView: React.FC<{ subjectId: string, subjectName: string, onBack: () => void }> = ({ subjectId, subjectName, onBack }) => {
    // Omitted for brevity
    return <div>...</div>
};


// --- Components ---

const SubjectCard: React.FC<{ subject: Subject, onClick: () => void, index: number }> = ({ subject, onClick, index }) => (
    <button 
        onClick={() => {
            if (navigator.vibrate) navigator.vibrate(5);
            onClick();
        }}
        className={`
            relative flex flex-col items-start p-6 rounded-[2rem] w-full text-left overflow-hidden 
            border border-white/10 
            ${bgGradients[subject.color]}
            transition-all duration-300 ease-out 
            active:scale-95 group 
            hover:-translate-y-2 hover:shadow-2xl ${shadowColors[subject.color]}
        `}
        style={{ 
            animation: `fade-in-up 0.6s ${index * 0.05}s cubic-bezier(0.2, 0.8, 0.2, 1) backwards`,
            WebkitTapHighlightColor: 'transparent' 
        }}
    >
        {getSubjectDecoration(subject.id, subject.color)}

        <div className={`relative mb-4 p-5 rounded-3xl bg-black/20 border border-white/10 shadow-sm text-white`}>
            {React.cloneElement(subject.icon as React.ReactElement, { width: 32, height: 32 })}
        </div>
        
        <div className="relative z-10 flex flex-col gap-0.5">
             <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">{subject.name}</h3>
             {subject.stream && (
                 <p className="text-xs font-bold text-gray-400/70 uppercase tracking-widest">{subject.stream}</p>
             )}
        </div>
    </button>
);


interface SubjectsViewProps {
    onSubjectSelect: (subjectName: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({ onSubjectSelect }) => {
    const [selectedClassId, setSelectedClassId] = useState<string>('10');
    const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Try to set the class based on user profile
        const user = getUser();
        const match = user.class.match(/\d+/); // Extract number from "Class 10th"
        if (match) {
            const num = match[0];
            if (parseInt(num) >= 6 && parseInt(num) <= 12) {
                setSelectedClassId(num);
            }
        }
    }, []);

    // Auto scroll to selected class pill
    useEffect(() => {
        if (scrollContainerRef.current) {
            const selectedBtn = scrollContainerRef.current.querySelector(`[data-id="${selectedClassId}"]`);
            if (selectedBtn) {
                selectedBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [selectedClassId]);

    const handleSubjectClick = (subject: Subject) => {
        // Only enable the Detail View for Class 6 for now as per request
        if (selectedClassId === '6') {
            setActiveSubject(subject);
        } else {
            // For other classes, fall back to the chat behavior
            const currentClassData = allClassData.find(c => c.id === selectedClassId);
            onSubjectSelect(`${subject.name} (${currentClassData?.label || ''})`);
        }
    };

    if (activeSubject) {
        // The full implementation of SubjectDetailView is omitted here for brevity as it wasn't changed.
        return <div className="p-4"><button onClick={() => setActiveSubject(null)}>Back</button><h1>{activeSubject.name} Details</h1></div>;
    }

    const currentClassData = allClassData.find(c => c.id === selectedClassId);
    const isSeniorSecondary = selectedClassId === '11' || selectedClassId === '12';

    // Group subjects by stream for 11/12, otherwise just list them
    const renderContent = () => {
        if (!currentClassData) return null;

        if (isSeniorSecondary) {
            const streams = ['Science', 'Commerce', 'Arts'] as const;
            return (
                <div className="flex flex-col gap-10 pb-32">
                    {streams.map((stream) => {
                        const streamSubjects = currentClassData.subjects.filter(s => s.stream === stream);
                        if (streamSubjects.length === 0) return null;
                        
                        return (
                            <div key={stream} className="animate-fade-in">
                                <div className="flex items-center gap-3 mb-4 px-2">
                                    <h2 className="text-2xl font-bold text-white tracking-tight">{stream}</h2>
                                    <div className="h-px flex-grow bg-gradient-to-r from-white/20 to-transparent"></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {streamSubjects.map((subject, idx) => (
                                        <SubjectCard 
                                            key={subject.id} 
                                            subject={subject} 
                                            index={idx}
                                            onClick={() => handleSubjectClick(subject)} 
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        } else {
            return (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-32 animate-fade-in">
                    {currentClassData.subjects.map((subject, idx) => (
                        <SubjectCard 
                            key={subject.id} 
                            subject={subject} 
                            index={idx}
                            onClick={() => handleSubjectClick(subject)} 
                        />
                    ))}
                </div>
            );
        }
    };

    return (
        <div className="w-full min-h-screen bg-black text-white">
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .animate-spin-slow { animation: spin 60s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10 pb-2">
                <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tighter mb-6">
                        Subjects
                    </h1>
                    
                    {/* Class Selector */}
                    <div 
                        ref={scrollContainerRef}
                        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 scroll-smooth"
                    >
                        {allClassData.map(cls => (
                            <button
                                key={cls.id}
                                data-id={cls.id}
                                onClick={() => {
                                    if (navigator.vibrate) navigator.vibrate(5);
                                    setSelectedClassId(cls.id);
                                }}
                                className={`
                                    flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap
                                    ${selectedClassId === cls.id 
                                        ? 'bg-white text-black scale-105' 
                                        : 'bg-[#1C1C1E] text-gray-400 hover:text-white hover:bg-[#2C2C2E] border border-white/5'}
                                `}
                            >
                                {cls.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-8">
                {renderContent()}
            </div>
        </div>
    );
};
