import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Course, MarketData, MarketInfo } from '../types.ts';
import { UserIcon, SearchIcon, FilterIcon, TrendingUpIcon, TrendingDownIcon, RefreshIcon } from './icons/Icons.tsx';
import { getMarketData } from '../services/geminiService.ts';


// --- MOCK DATA & ILLUSTRATIONS ---

const IllustrationOnboarding = () => (
    <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M65 145C65 145 152.662 161.42 165.5 107.5C178.338 53.5804 121.5 50 121.5 50" stroke="#4A4A4A" strokeWidth="2" strokeDasharray="4 4"/>
        <g filter="url(#filter0_d_101_2)">
            <rect x="25" y="86" width="70" height="50" rx="8" fill="#FFB74D"/>
            <path d="M40 102L50 112L65 97" stroke="#1C1C1E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <g filter="url(#filter1_d_101_2)">
            <rect x="145" y="25" width="70" height="50" rx="8" fill="#F48FB1"/>
            <path d="M160 45L170 45" stroke="#1C1C1E" strokeWidth="3" strokeLinecap="round"/>
            <path d="M175 55L180 55" stroke="#1C1C1E" strokeWidth="3" strokeLinecap="round"/>
            <path d="M160 55L165 55" stroke="#1C1C1E" strokeWidth="3" strokeLinecap="round"/>
        </g>
        <g filter="url(#filter2_d_101_2)">
            <rect x="80" y="45" width="70" height="50" rx="8" fill="#B5E48C"/>
            <path d="M95 60L110 75" stroke="#1C1C1E" strokeWidth="3" strokeLinecap="round"/>
            <path d="M110 60L95 75" stroke="#1C1C1E" strokeWidth="3" strokeLinecap="round"/>
        </g>
        <defs>
            <filter id="filter0_d_101_2" x="20" y="82" width="80" height="60" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="1"/>
                <feGaussianBlur stdDeviation="2.5"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_101_2"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_101_2" result="shape"/>
            </filter>
            <filter id="filter1_d_101_2" x="140" y="21" width="80" height="60" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="1"/>
                <feGaussianBlur stdDeviation="2.5"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_101_2"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_101_2" result="shape"/>
            </filter>
            <filter id="filter2_d_101_2" x="75" y="41" width="80" height="60" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="1"/>
                <feGaussianBlur stdDeviation="2.5"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_101_2"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_101_2" result="shape"/>
            </filter>
        </defs>
    </svg>
);


const IllustrationFigma = () => (
    <svg viewBox="0 0 130 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M43.5 83C66.5 83 75.5 83 75.5 83" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round"/>
        <rect x="53" y="27" width="55" height="36" rx="4" fill="#FFF176"/>
        <path d="M60.038 48.018L64.49 37.104H69.17L70.13 41.22L74.81 37.104H79.67L74.03 43.128L80.15 52H75.11L70.13 45.984L66.77 49.344V52H62.19L60.038 48.018Z" fill="#1C1C1E"/>
        <path d="M70.5 73.5L78.5 63.5" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const IllustrationFlowchart = () => (
    <svg viewBox="0 0 130 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="40" y="30" width="28" height="18" rx="3" fill="#F48FB1"/>
        <rect x="78" y="55" width="28" height="18" rx="3" fill="#B5E48C"/>
        <path d="M54 48V59.5C54 60.6046 54.8954 61.5 56 61.5H78" stroke="#8E8E93" strokeWidth="2"/>
        <path d="M74 65.5L78 61.5L74 57.5" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const coursesData: Course[] = [
    {
        id: '1',
        title: 'UI/UX Flowchart',
        author: 'By Caroline',
        category: 'UI Design',
        duration: '12h 56min',
        lessonCount: 22,
        illustration: <IllustrationFlowchart />,
        color: 'green',
        lessons: [
            { id: 'l1-1', title: 'Introduction', duration: '8 Minutes', isFree: true },
            { id: 'l1-2', title: 'Ideation', duration: '23 Minutes', isFree: true },
            { id: 'l1-3', title: 'Ideation & Brainstorming', duration: '45 Minutes', isFree: false },
            { id: 'l1-4', title: 'Wireframing', duration: '1h 10min', isFree: false },
            { id: 'l1-5', title: 'Prototyping', duration: '1h 30min', isFree: false },
        ]
    },
    {
        id: '2',
        title: 'Illustration With Figma',
        author: 'By Joseph S.',
        category: 'UI Design',
        duration: '10h 30min',
        lessonCount: 18,
        illustration: <IllustrationFigma />,
        color: 'blue',
        lessons: [
            { id: 'l2-1', title: 'Welcome to Figma', duration: '12 Minutes', isFree: true },
            { id: 'l2-2', title: 'Basic Shapes & Tools', duration: '35 Minutes', isFree: false },
            { id: 'l2-3', title: 'Pen Tool Mastery', duration: '1h 5min', isFree: false },
            { id: 'l2-4', title: 'Color Theory', duration: '50 Minutes', isFree: false },
        ]
    }
];

// --- COMPONENTS ---
const MARKET_CACHE_KEY = 'marketDataCache';
const CACHE_STALE_HOURS = 6; // Cache is valid for 6 hours

const MarketSkeletonCard: React.FC = () => (
    <div className="bg-gray-100 p-4 rounded-xl animate-pulse w-40 flex-shrink-0">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
);

const MarketCard: React.FC<{ info: MarketInfo }> = ({ info }) => {
    const isUp = info.changeType === 'up';
    const isDown = info.changeType === 'down';
    const colorClass = isUp ? 'text-emerald-500' : isDown ? 'text-red-500' : 'text-gray-500';

    const formattedValue = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2,
    }).format(parseFloat(info.value));

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 w-40 flex-shrink-0">
            <p className="text-sm font-medium text-gray-500 truncate">{info.name}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
                {info.name.toLowerCase().includes('gold') || info.name.toLowerCase().includes('silver') ? '₹' : ''}{formattedValue}
            </p>
            <div className={`flex items-center gap-1 text-sm font-semibold mt-1 ${colorClass}`}>
                {isUp && <TrendingUpIcon />}
                {isDown && <TrendingDownIcon />}
                <span>{info.change}</span>
            </div>
        </div>
    );
};

const MarketSnapshot: React.FC = () => {
    const [marketData, setMarketData] = useState<MarketData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const cachedItem = localStorage.getItem(MARKET_CACHE_KEY);
            if (cachedItem) {
                const { data, timestamp } = JSON.parse(cachedItem);
                const ageInHours = (Date.now() - timestamp) / (1000 * 60 * 60);
                if (ageInHours < CACHE_STALE_HOURS) {
                    setMarketData(data);
                    setIsLoading(false);
                    return;
                }
            }
        } catch (e) {
            console.error("Failed to read market data from cache", e);
            localStorage.removeItem(MARKET_CACHE_KEY);
        }

        try {
            const data = await getMarketData();
            setMarketData(data);
            const cachePayload = { data, timestamp: Date.now() };
            localStorage.setItem(MARKET_CACHE_KEY, JSON.stringify(cachePayload));
        } catch (err: any) {
            if (navigator.vibrate) navigator.vibrate([75, 50, 75]);
            setError(err.message || "Failed to fetch market data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    return (
        <div className="mb-8">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Market Snapshot</h2>
            </div>
            {error && !isLoading && (
                 <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-4 text-center">
                    <p>{error}</p>
                 </div>
            )}
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
               {isLoading ? (
                   <>
                       <MarketSkeletonCard />
                       <MarketSkeletonCard />
                       <MarketSkeletonCard />
                       <MarketSkeletonCard />
                   </>
               ) : marketData ? (
                   <>
                       <MarketCard info={marketData.nifty50} />
                       <MarketCard info={marketData.sensex} />
                       <MarketCard info={marketData.gold} />
                       <MarketCard info={marketData.silver} />
                   </>
               ) : null}
            </div>
        </div>
    );
}

const CategoryPill: React.FC<{ label: string; count: number; isActive: boolean; onClick: () => void;}> = ({ label, count, isActive, onClick }) => (
    <button
        onClick={() => {
            if (navigator.vibrate) navigator.vibrate(5);
            onClick();
        }}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex-shrink-0 ${
            isActive ? 'bg-[var(--accent-orange)] text-black' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
        }`}
    >
        {label} <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${isActive ? 'bg-black/10' : 'bg-gray-900/10'}`}>{count}</span>
    </button>
);

const CourseCard: React.FC<{ course: Course; onSelect: () => void; }> = ({ course, onSelect }) => {
    const bgColor = course.color === 'green' ? 'bg-[var(--bg-card-green)]' : 'bg-[var(--bg-card-blue)]';
    const darkTextColor = course.color === 'green' ? 'text-[var(--bg-card-green-darker)]' : 'text-[var(--bg-card-blue-darker)]';
    
    return (
        <div className="w-full break-inside-avoid-column mb-6">
            <div className={`relative rounded-2xl p-5 ${bgColor} ${darkTextColor} overflow-hidden border border-black/5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold">{course.title}</h2>
                    <p className="font-medium mt-1">{course.author}</p>
                    <button onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(5);
                        onSelect();
                    }} className="mt-8 bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 group">
                        Start Learning
                        <span className="transform transition-transform group-hover:translate-x-1">&rarr;</span>
                    </button>
                </div>
                 <div className="absolute -right-4 -bottom-4 opacity-80">
                    {course.illustration}
                </div>
            </div>
        </div>
    );
};

interface ExploreViewProps {
  onCourseSelect: (course: Course) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onCourseSelect }) => {
    const [activeCategory, setActiveCategory] = useState<'All' | 'UI Design' | 'Webflow' | 'Development'>('All');
    
    const filteredCourses = useMemo(() => {
        if (activeCategory === 'All') return coursesData;
        return coursesData.filter(c => c.category === activeCategory);
    }, [activeCategory]);
    
    const categories = ['All', 'UI Design', 'Webflow', 'Development'];

    return (
        <div className="w-full max-w-7xl mx-auto animate-fade-in p-4 pt-8 text-gray-900">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 via-red-500 to-orange-400 flex items-center justify-center text-white">
                        <UserIcon />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Hello,</p>
                        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Chou Tzuyu 😎</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { if (navigator.vibrate) navigator.vibrate(5); }} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                        <SearchIcon />
                    </button>
                    <button onClick={() => { if (navigator.vibrate) navigator.vibrate(5); }} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                        <FilterIcon /> 
                    </button>
                </div>
            </header>
            
            <MarketSnapshot />

            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 mb-6">
                {categories.map(cat => (
                    <CategoryPill
                        key={cat}
                        label={cat}
                        count={cat === 'All' ? coursesData.length : coursesData.filter(c => c.category === cat).length}
                        isActive={activeCategory === cat}
                        onClick={() => setActiveCategory(cat as any)}
                    />
                ))}
            </div>

            <div className="md:columns-2 gap-6">
                {filteredCourses.map(course => (
                    <CourseCard key={course.id} course={course} onSelect={() => onCourseSelect(course)} />
                ))}
            </div>
            
            <style>{`
                .break-inside-avoid-column { break-inside: avoid; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-out; }
            `}</style>
        </div>
    );
};