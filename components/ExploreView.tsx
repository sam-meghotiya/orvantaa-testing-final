
import React, { useState, useEffect } from 'react';
import { StudyAnalytics, SubjectPerformance, UpcomingTask, Recommendation, TrendingTopic } from '../types.ts';
import { UserIcon, ClockIcon, AiSparkleIcon, FlameIcon, BrainCircuitIcon, BookmarkIcon } from './icons/Icons.tsx';
import { getUser, subscribe } from '../services/userService.ts';

// --- DATA CONFIGURATION ---
const colorMap = {
    blue: { soft: 'var(--accent-blue-soft)', solid: 'var(--accent-blue)' },
    green: { soft: 'var(--accent-green-soft)', solid: 'var(--accent-green)' },
    purple: { soft: 'var(--accent-purple-soft)', solid: 'var(--accent-purple)' },
    orange: { soft: 'var(--accent-orange-soft)', solid: 'var(--accent-orange)' },
};

type AccentColor = keyof typeof colorMap;

const analyticsData: (Omit<StudyAnalytics, 'icon'> & { color: AccentColor; icon: React.ReactNode })[] = [
    { id: 'studyHours', title: 'Study Hours', value: '12.5h', change: '+1.2h', changeType: 'up', icon: <ClockIcon />, color: 'blue' },
    { id: 'doubtsSolved', title: 'Doubts Solved', value: '82', change: '+5', changeType: 'up', icon: <AiSparkleIcon width={20} height={20} />, color: 'purple' },
    { id: 'topicsMastered', title: 'Topics Mastered', value: '14', change: '+2', changeType: 'up', icon: <BrainCircuitIcon />, color: 'orange' },
    { id: 'learningStreak', title: 'Learning Streak', value: '21 days', change: '+1', changeType: 'up', icon: <FlameIcon />, color: 'green' },
];

const subjectPerformanceData: SubjectPerformance[] = [
    { name: 'Physics', progress: 75, color: 'var(--accent-blue)' },
    { name: 'Chemistry', progress: 60, color: 'var(--accent-purple)' },
    { name: 'Mathematics', progress: 85, color: 'var(--accent-green)' },
    { name: 'Biology', progress: 50, color: 'var(--accent-yellow)' },
];

const upcomingTasksData: UpcomingTask[] = [
    { title: 'Chapter 5 Quiz', subject: 'Physics', dueDate: 'Tomorrow' },
    { title: 'Organic Chem Assignment', subject: 'Chemistry', dueDate: '3 days left' },
    { title: 'Calculus Test', subject: 'Mathematics', dueDate: '1 week left' },
];

const recommendationsData: Recommendation[] = [
    { type: 'Revise', title: 'Newton\'s Laws of Motion', description: 'Your accuracy on recent quizzes was low.' },
    { type: 'Practice', title: 'Algebraic Equations', description: 'Strengthen your fundamentals with a worksheet.' },
    { type: 'Explore', title: 'Quantum Mechanics', description: 'A new topic related to your interests.' },
];

const trendingTopicsData: TrendingTopic[] = [
    { query: 'What is the significance of the G20 summit?', engagement: '1.2k doubts' },
    { query: 'Explain the mechanism of an mRNA vaccine.', engagement: '980 doubts' },
    { query: 'Latest discoveries from the James Webb telescope.', engagement: '750 doubts' },
];


// --- RE-DESIGNED WIDGETS ---

const NewChatWidget: React.FC<{ onNewChat: () => void }> = ({ onNewChat }) => (
    <div 
        onClick={() => { if (navigator.vibrate) navigator.vibrate(5); onNewChat(); }}
        className="cursor-pointer group relative bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] p-6 rounded-3xl flex items-center justify-between overflow-hidden hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300"
    >
        <div className="z-10">
            <h2 className="text-2xl font-bold text-white">Ask anything</h2>
            <p className="text-white/80 mt-1">Get instant help with any topic.</p>
        </div>
        <div className="absolute -right-8 -bottom-8 text-white/20 group-hover:scale-125 group-hover:text-white/30 transition-transform duration-500 ease-out z-0">
            <AiSparkleIcon width={128} height={128} />
        </div>
        <div className="relative z-10 text-white bg-white/20 p-3 rounded-full transform transition-transform group-hover:scale-110">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>
    </div>
);

const AnalyticsWidget: React.FC = () => (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-5 h-full">
        <h3 className="font-semibold text-[var(--text-main)] mb-4 text-lg">Your Progress</h3>
        <div className="grid grid-cols-2 gap-4">
            {analyticsData.map(item => (
                <div key={item.id} className="bg-[var(--bg-tertiary)] p-3 rounded-xl transform transition-transform hover:scale-105">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                        style={{ backgroundColor: colorMap[item.color].soft, color: colorMap[item.color].solid }}
                    >
                        {item.icon}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{item.title}</p>
                    <p className="text-xl font-bold text-[var(--text-main)]">{item.value}</p>
                </div>
            ))}
        </div>
    </div>
);

const MasteryProgressWidget: React.FC = () => (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-5 h-full">
        <h3 className="font-semibold text-[var(--text-main)] mb-4 text-lg">Subject Mastery</h3>
        <div className="space-y-4">
            {subjectPerformanceData.map(subject => (
                <div key={subject.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-[var(--text-main)]">{subject.name}</span>
                        <span className="font-semibold text-[var(--text-secondary)]">{subject.progress}%</span>
                    </div>
                    <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2.5 overflow-hidden">
                        <div className="h-2.5 rounded-full" style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const RecommendationCard: React.FC<{ item: Recommendation }> = ({ item }) => {
    const accentColor = item.type === 'Revise' ? colorMap.orange : item.type === 'Practice' ? colorMap.blue : colorMap.purple;
    return (
        <div className="border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 rounded-2xl flex-shrink-0 w-[280px] h-36 flex flex-col justify-between transition-all hover:border-white/30 hover:scale-[1.02]">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor.solid }}>{item.type}</p>
                <h4 className="font-semibold text-[var(--text-main)] mt-1.5 line-clamp-2">{item.title}</h4>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">{item.description}</p>
        </div>
    );
};

const UpcomingTasksWidget: React.FC = () => (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-5 h-full">
        <h3 className="font-semibold text-[var(--text-main)] mb-4 text-lg">Upcoming</h3>
        <div className="space-y-4">
            {upcomingTasksData.map((task, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center bg-[var(--accent-orange-soft)] text-[var(--accent-orange)]">
                        <BookmarkIcon />
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-[var(--text-main)]">{task.title}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{task.subject} &bull; {task.dueDate}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const TrendingTopicsWidget: React.FC = () => (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-5 h-full">
        <h3 className="font-semibold text-[var(--text-main)] mb-3 text-lg">Trending Now</h3>
        <div className="space-y-1">
           {trendingTopicsData.map((topic, i) => (
                <div key={i} className="flex items-center justify-between text-sm hover:bg-[var(--bg-tertiary)] p-2 -mx-2 rounded-lg cursor-pointer transition-colors group">
                    <p className="text-[var(--text-secondary)] flex-grow pr-4 group-hover:text-white transition-colors line-clamp-1">{topic.query}</p>
                    <p className="text-[var(--text-muted)] font-mono text-xs flex-shrink-0 whitespace-nowrap">{topic.engagement}</p>
                </div>
            ))}
        </div>
    </div>
);


// --- MAIN DASHBOARD COMPONENT ---

interface ExploreViewProps {
    onNewChat: () => void;
}

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    return "Good evening";
};

export const ExploreView: React.FC<ExploreViewProps> = ({ onNewChat }) => {
    const [user, setUser] = useState(() => getUser());

    useEffect(() => {
        // Subscribe to user changes
        const unsubscribe = subscribe(setUser);
        
        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto animate-fade-in p-4 pt-6 text-white">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-[var(--text-main)] tracking-tight">{getGreeting()}</h1>
                    <p className="text-lg text-[var(--text-secondary)]">{user.name || 'Welcome!'}</p>
                </div>
                 <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] p-1">
                    {user.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-fuchsia-500 via-red-500 to-orange-400 flex items-center justify-center">
                            <UserIcon />
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <div className="md:col-span-2 lg:col-span-4">
                  <NewChatWidget onNewChat={onNewChat} />
                </div>
        
                <div className="md:col-span-1 lg:col-span-2">
                  <AnalyticsWidget />
                </div>
        
                <div className="md:col-span-1 lg:col-span-2">
                  <MasteryProgressWidget />
                </div>
        
                <div className="md:col-span-2 lg:col-span-4">
                    <h3 className="font-semibold text-[var(--text-main)] text-xl mb-3">Recommended For You</h3>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
                        {recommendationsData.map((rec, i) => <RecommendationCard key={i} item={rec} />)}
                    </div>
                </div>
        
                <div className="lg:col-span-2">
                   <UpcomingTasksWidget />
                </div>

                <div className="lg:col-span-2">
                   <TrendingTopicsWidget />
                </div>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};