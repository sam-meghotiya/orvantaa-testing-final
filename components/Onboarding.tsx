import React, { useState, useEffect } from 'react';
import { Orb } from './Orb.tsx';
import { BookOpenIcon, CompassIcon, HistoryIcon, UserIcon, LockIcon } from './icons/Icons.tsx';

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,36.632,44,30.85,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
);

interface OnboardingProps {
    onComplete: () => void;
}

const IllustrationOnboarding = () => (
    <div className="my-8">
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
    </div>
);

const IllustrationQuizzes = () => (
    <div className="my-8">
        <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter_quiz_1)">
                <rect x="70" y="30" width="100" height="120" rx="12" fill="#FFB74D"/>
                <text x="120" y="110" fontFamily="Poppins, sans-serif" fontSize="80" fontWeight="bold" textAnchor="middle" fill="#1C1C1E">?</text>
            </g>
            <g filter="url(#filter_quiz_2)">
                 <rect x="30" y="60" width="60" height="60" rx="8" fill="#B5E48C" transform="rotate(-15 60 90)"/>
                 <path d="M52 92l8 8 16-16" stroke="#1C1C1E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(-15 60 90)"/>
            </g>
             <g filter="url(#filter_quiz_3)">
                 <rect x="150" y="70" width="60" height="60" rx="8" fill="#F48FB1" transform="rotate(15 180 100)"/>
                 <path d="M172 95l16-16" stroke="#1C1C1E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(15 180 100)"/>
                 <path d="M188 95l-16-16" stroke="#1C1C1E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(15 180 100)"/>
            </g>
            <defs>
                 <filter id="filter_quiz_1" x="65" y="26" width="110" height="130" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="1"/><feGaussianBlur stdDeviation="2.5"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_101_2"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_101_2" result="shape"/>
                </filter>
                 <filter id="filter_quiz_2" x="20" y="50" width="80" height="80" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="1"/><feGaussianBlur stdDeviation="2.5"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_101_2"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_101_2" result="shape"/>
                </filter>
                 <filter id="filter_quiz_3" x="140" y="60" width="80" height="80" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="1"/><feGaussianBlur stdDeviation="2.5"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_101_2"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_101_2" result="shape"/>
                </filter>
            </defs>
        </svg>
    </div>
);


export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [page, setPage] = useState(0); // 0 = splash, 1 = page one, 2 = page two
    
    useEffect(() => {
        if (page === 0) {
            const timer = setTimeout(() => {
                setPage(1);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [page]);

    const renderContent = () => {
        switch (page) {
            case 0:
                return (
                    <div className="flex flex-col items-center justify-center h-full animate-fade-in-slow text-center">
                        <div className="w-16 h-16 bg-yellow-300 rounded-full mb-4"></div>
                        <h1 className="font-poppins text-5xl font-bold text-white tracking-tight">
                            Orvantaa
                        </h1>
                    </div>
                );
            case 1:
                return (
                     <div className="w-full max-w-md mx-auto flex flex-col items-center justify-between h-full text-center p-8 animate-fade-in">
                        <div className="w-full">
                            <IllustrationOnboarding />
                            <h2 className="text-4xl font-bold text-white leading-tight">Let's learn with our exciting course!</h2>
                            <p className="text-base text-[var(--text-secondary)] mt-4 max-w-xs mx-auto">Discover thousands of courses and reach new milestones every day.</p>
                        </div>
                        
                        <div className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
                            </div>
                            <button onClick={() => {
                                if (navigator.vibrate) navigator.vibrate(5);
                                setPage(2);
                            }} className="bg-[var(--accent-green)] text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-300 transition-transform hover:scale-105">
                                Next &rarr;
                            </button>
                        </div>
                    </div>
                );
            case 2:
                 return (
                    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-between h-full text-center p-8 animate-fade-in">
                       <div className="w-full">
                           <IllustrationQuizzes />
                           <h2 className="text-4xl font-bold text-white leading-tight">Test your knowledge with fun quizzes!</h2>
                           <p className="text-base text-[var(--text-secondary)] mt-4 max-w-xs mx-auto">Challenge yourself and track your progress with interactive tests.</p>
                       </div>
                       
                       <div className="w-full flex items-center justify-between">
                           <div className="flex items-center gap-2">
                               <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
                               <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                           </div>
                           <button onClick={() => {
                                if (navigator.vibrate) navigator.vibrate(10);
                                onComplete();
                           }} className="bg-[var(--accent-green)] text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-300 transition-transform hover:scale-105">
                               Get Started
                           </button>
                       </div>
                   </div>
               );
            default: return null;
        }
    };
    
    return (
        <div className="fixed inset-0 z-[100] bg-[var(--bg-main)]">
             <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-slow { animation: fade-in-slow 1s ease-out forwards; }
             `}</style>
            <div className="relative w-full h-full flex flex-col items-center justify-center">
                {renderContent()}
            </div>
        </div>
    );
};