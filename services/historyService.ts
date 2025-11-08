
import { Conversation } from '../types.ts';

const HISTORY_KEY = 'orvanta-history';

export const loadHistory = (): Conversation[] => {
  try {
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) {
      // Basic validation
      const parsed = JSON.parse(storedHistory);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load or parse history from localStorage:", error);
    // If parsing fails, clear the corrupted data
    localStorage.removeItem(HISTORY_KEY);
  }
  return [];
};

export const saveHistory = (history: Conversation[]): void => {
  try {
    const historyString = JSON.stringify(history);
    localStorage.setItem(HISTORY_KEY, historyString);
  } catch (error) {
    console.error("Failed to save history to localStorage:", error);
  }
};
