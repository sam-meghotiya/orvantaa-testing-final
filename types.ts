// Fix: Import React to resolve 'Cannot find namespace React' error.
import React from 'react';

// Fix: Added full type definitions for the application.

export interface Interaction {
  query: string;
  response: string;
  followUpPrompts?: string[];
  isLoading?: boolean; // For streaming or loading state of a specific interaction
  image?: string | null;
}

export interface Conversation {
  id: string;
  title: string;
  interactions: Interaction[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// In the UI, a session is a wrapper for a conversation,
// allowing for multiple conversations (tabs) to be managed.
export interface ChatSession {
  id: string;
  conversation: Conversation;
}

// --- Course Types ---
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isFree: boolean;
}

export interface Course {
  id: string;
  title: string;
  author: string;
  category: 'UI Design' | 'Webflow' | 'Development';
  duration: string;
  lessonCount: number;
  illustration: React.ReactNode;
  lessons: Lesson[];
  color: 'green' | 'blue';
}


export interface ExploreTopic {
  title: string;
  description: string;
  category: string;
  prompt: string;
}

export interface MarketInfo {
  name: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
}

export interface MarketData {
  nifty50: MarketInfo;
  sensex: MarketInfo;
  gold: MarketInfo;
  silver: MarketInfo;
}

// --- Quiz Types ---

export interface Answer {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  text: string;
  options: Answer[];
  explanation: string;
}

export interface Quiz {
  id:string;
  title: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: Question[];
}