import React, { useState, useEffect, useMemo } from 'react';
import { getQuizzes, getQuizById } from '../services/quizService.ts';
import { Quiz, Question, Answer } from '../types.ts';
import { HistoryIcon, OracleIcon, ScienceIcon, CheckCircleIcon, XCircleIcon } from './icons/Icons.tsx';

// --- Quiz List View ---
const QuizCard: React.FC<{ quiz: Quiz; onStart: () => void; index: number }> = ({ quiz, onStart, index }) => {
    const getIconForSubject = (subject: string) => {
        const s = subject.toLowerCase();
        if (s.includes('science') || s.includes('tech')) return <ScienceIcon width={24} height={24} />;
        if (s.includes('history')) return <HistoryIcon width={24} height={24} />;
        return <OracleIcon />;
    };

    return (
        <div 
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-5 flex flex-col gap-3 group transition-all duration-300 hover:border-white/50 shadow-lg hover:shadow-white/10"
            style={{ animation: `fade-in-up 0.5s ${(index * 0.05)}s ease-out backwards` }}
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-full text-white">{getIconForSubject(quiz.subject)}</div>
                <div>
                    <span className="px-2.5 py-0.5 text-xs bg-white/5 text-white/70 rounded-full border border-white/10">{quiz.subject}</span>
                </div>
            </div>
            <h3 className="font-bold text-lg text-white flex-grow">{quiz.title}</h3>
            <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                <span>{quiz.questions.length} Questions</span>
                <span className={`px-2 py-0.5 rounded text-xs ${quiz.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>{quiz.difficulty}</span>
            </div>
            <button
                onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(5);
                    onStart();
                }}
                className="w-full mt-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-transform hover:scale-105"
            >
                Start Quiz
            </button>
        </div>
    );
};

const QuizListView: React.FC<{ onStartQuiz: (quizId: string) => void }> = ({ onStartQuiz }) => {
    const quizzes = getQuizzes();
    return (
        <div className="w-full max-w-7xl mx-auto animate-fade-in px-4">
            <div className="text-center mb-12">
                <h1 className="font-poppins text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tighter">
                    Test Your Knowledge
                </h1>
                <p className="text-sm md:text-base text-[var(--text-muted)] mt-2 tracking-tight">
                    Select a quiz to begin.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {quizzes.map((quiz, index) => (
                    <QuizCard key={quiz.id} quiz={quiz} onStart={() => onStartQuiz(quiz.id)} index={index} />
                ))}
            </div>
        </div>
    );
};

// --- Active Quiz View ---
const QuizActiveView: React.FC<{ quiz: Quiz; onComplete: (answers: number[]) => void; }> = ({ quiz, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(quiz.questions.length * 20); // 20 seconds per question

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleNextQuestion();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [currentQuestionIndex]);
    
    const handleNextQuestion = () => {
        const finalAnswers = [...userAnswers, selectedOption ?? -1];
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setUserAnswers(finalAnswers);
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
        } else {
            onComplete(finalAnswers);
        }
    };

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center animate-fade-in p-4">
            <div className="w-full bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl shadow-white/5">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-semibold text-white">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                    <span className="px-3 py-1 text-sm font-bold bg-white/10 text-white rounded-full tabular-nums">{minutes}:{seconds.toString().padStart(2, '0')}</span>
                </div>
                
                <p className="text-lg md:text-xl font-semibold text-white text-left mb-8 min-h-[6rem]">{currentQuestion.text}</p>
                
                <div className="flex flex-col gap-4">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                if (navigator.vibrate) navigator.vibrate(5);
                                setSelectedOption(index);
                            }}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 text-base font-medium
                                ${selectedOption === index 
                                    ? 'bg-white/20 border-white/80 text-white ring-2 ring-white/50' 
                                    : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40'}`}
                        >
                            {option.text}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(10);
                        handleNextQuestion();
                    }}
                    disabled={selectedOption === null}
                    className="w-full mt-8 bg-white text-black px-6 py-3 rounded-lg text-base font-semibold hover:bg-gray-300 transition-transform hover:scale-105 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {currentQuestionIndex < quiz.questions.length - 1 ? 'Next' : 'Submit'}
                </button>
            </div>
        </div>
    );
};

// --- Quiz Results View ---
const DonutChart: React.FC<{ percent: number }> = ({ percent }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
            <circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="transparent" />
            <circle
                cx="60" cy="60" r={radius}
                stroke="url(#gradient)" strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
            />
             <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#a7f3d0" />
                </linearGradient>
            </defs>
        </svg>
    );
}

const QuizResultsView: React.FC<{ quiz: Quiz; userAnswers: number[]; onRetry: () => void; onBackToList: () => void; }> = ({ quiz, userAnswers, onRetry, onBackToList }) => {
    const score = useMemo(() => {
        return userAnswers.reduce((acc, answerIndex, questionIndex) => {
            if (answerIndex !== -1 && quiz.questions[questionIndex].options[answerIndex].isCorrect) {
                return acc + 1;
            }
            return acc;
        }, 0);
    }, [userAnswers, quiz]);

    const incorrectAnswers = useMemo(() => {
        return quiz.questions.map((q, i) => ({ q, userAnswerIndex: userAnswers[i] }))
            .filter(({ q, userAnswerIndex }) => userAnswerIndex === -1 || !q.options[userAnswerIndex].isCorrect);
    }, [quiz, userAnswers]);

    const percentage = (score / quiz.questions.length) * 100;
    
    useEffect(() => {
        if (navigator.vibrate) {
            if (percentage >= 70) {
                navigator.vibrate([5, 50, 5]); // success
            } else if (percentage < 40) {
                navigator.vibrate([75, 50, 75]); // fail
            }
        }
    }, [percentage]);

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in p-4">
            <div className="w-full bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl shadow-white/5">
                <h2 className="text-3xl font-bold text-white text-center">Quiz Results</h2>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 my-8">
                    <div className="relative flex items-center justify-center">
                        <DonutChart percent={percentage} />
                        <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-bold text-white">{Math.round(percentage)}%</span>
                            <span className="text-sm text-[var(--text-muted)]">Score</span>
                        </div>
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-lg text-[var(--text-secondary)]">You answered</p>
                        <p className="text-5xl font-bold text-white my-1">{score} / {quiz.questions.length}</p>
                        <p className="text-lg text-[var(--text-secondary)]">questions correctly.</p>
                    </div>
                </div>

                {incorrectAnswers.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Review Your Answers</h3>
                        <div className="flex flex-col gap-6">
                            {incorrectAnswers.map(({ q, userAnswerIndex }, index) => {
                                const correctOption = q.options.find(opt => opt.isCorrect);
                                return (
                                    <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                                        <p className="font-semibold text-white mb-3">{q.text}</p>
                                        <div className="flex items-start gap-2 text-sm text-red-400">
                                            <XCircleIcon />
                                            <span>Your answer: <span className="font-semibold">{userAnswerIndex === -1 ? "Not answered" : q.options[userAnswerIndex].text}</span></span>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm text-emerald-400 mt-2">
                                            <CheckCircleIcon />
                                            <span>Correct answer: <span className="font-semibold">{correctOption?.text}</span></span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-white/10 text-sm text-[var(--text-secondary)]">
                                            <p><strong className="text-white/80">Explanation:</strong> {q.explanation}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                     <button onClick={() => {
                         if (navigator.vibrate) navigator.vibrate(5);
                         onBackToList();
                     }} className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors">
                        Back to Quizzes
                    </button>
                    <button onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(5);
                        onRetry();
                    }} className="w-full sm:w-auto bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-transform hover:scale-105">
                        Retry Quiz
                    </button>
                </div>
            </div>
        </div>
    );
}


// --- Main Quizzes View Component ---
export const QuizzesView: React.FC = () => {
    const [view, setView] = useState<'list' | 'active' | 'results'>('list');
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [userAnswers, setUserAnswers] = useState<number[]>([]);

    const handleStartQuiz = (quizId: string) => {
        const quiz = getQuizById(quizId);
        if (quiz) {
            setActiveQuiz(quiz);
            setUserAnswers([]);
            setView('active');
        }
    };
    
    const handleQuizComplete = (answers: number[]) => {
        setUserAnswers(answers);
        setView('results');
    };

    const handleRetry = () => {
        if (activeQuiz) {
            setUserAnswers([]);
            setView('active');
        }
    };

    return (
        <>
            <style>{`
              @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
              @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
              .animate-fade-in { animation: fade-in 0.5s ease-out; }
            `}</style>
            {view === 'list' && <QuizListView onStartQuiz={handleStartQuiz} />}
            {view === 'active' && activeQuiz && <QuizActiveView quiz={activeQuiz} onComplete={handleQuizComplete} />}
            {view === 'results' && activeQuiz && <QuizResultsView quiz={activeQuiz} userAnswers={userAnswers} onRetry={handleRetry} onBackToList={() => setView('list')} />}
        </>
    );
};