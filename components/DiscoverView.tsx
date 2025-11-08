import React from 'react';
import { Course } from '../types.ts';
import { ChevronLeftIcon, ClockIcon, BookOpenIcon, PlayCircleIcon, LockIcon } from './icons/Icons.tsx';

interface CourseDetailViewProps {
    course: Course;
    onBack: () => void;
}

const StatChip: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
        {icon}
        <span>{label}</span>
    </div>
);

const LessonItem: React.FC<{ title: string; duration: string; isFree: boolean; isLocked?: boolean }> = ({ title, duration, isFree, isLocked }) => (
    <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-2xl">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-black/20 rounded-full text-white">
           {isFree ? <PlayCircleIcon /> : <LockIcon />}
        </div>
        <div className="flex-grow">
            <p className="font-semibold text-white">{title}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{duration}</p>
        </div>
        {isFree && <span className="px-2 py-0.5 text-xs bg-orange-400/20 text-orange-300 rounded-full font-medium">Free</span>}
    </div>
);

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({ course, onBack }) => {
    const bgColor = course.color === 'green' ? 'bg-[var(--bg-card-green)]' : 'bg-[var(--bg-card-blue)]';
    const twoFreeVideos = course.lessons.filter(l => l.isFree).length;

    return (
        <div className="min-h-screen w-full bg-[var(--bg-main)] animate-fade-in">
            <div className="relative w-full h-80">
                <div className={`absolute inset-0 ${bgColor} rounded-b-3xl flex items-center justify-center overflow-hidden`}>
                     <div className="transform scale-150 opacity-80">
                         {course.illustration}
                     </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-6 left-4">
                    <button onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(5);
                        onBack();
                    }} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                        <ChevronLeftIcon />
                    </button>
                </div>
                <div className="absolute bottom-6 left-4 right-4">
                    <h1 className="text-3xl font-bold text-white">{course.title}</h1>
                    <div className="flex items-center gap-3 mt-4">
                        <StatChip icon={<ClockIcon />} label={course.duration} />
                        <StatChip icon={<BookOpenIcon width={20} height={20}/>} label={`${course.lessonCount} Lessons`} />
                    </div>
                </div>
            </div>
            
            <div className="p-4 pb-32">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-white text-lg">Course Preview</h2>
                    {twoFreeVideos > 0 && 
                        <span className="px-3 py-1 text-sm bg-red-500/20 text-red-300 rounded-full font-semibold">
                           ⚡ {twoFreeVideos} Free Videos
                        </span>
                    }
                </div>
                <div className="flex flex-col gap-3">
                    {course.lessons.map(lesson => (
                        <LessonItem key={lesson.id} {...lesson} />
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--bg-main)] to-transparent">
                <button onClick={() => { if (navigator.vibrate) navigator.vibrate(10); }} className="w-full bg-[var(--accent-green)] text-black rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-black/30">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-black/10 rounded-full"><LockIcon/></div>
                        <span className="font-bold">Swipe to unlock &gt;&gt;&gt;</span>
                    </div>
                    <span className="font-bold text-2xl">$126</span>
                </button>
            </div>
            
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.4s ease-out; }
            `}</style>
        </div>
    );
};