import { useState, useEffect, useRef } from 'react';

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const SpeechRecognitionAPI = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    // Setting continuous to false makes the recognition stop automatically
    // after the user stops speaking. This is better for single-query inputs
    // and avoids potential issues with result accumulation causing repetition.
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const fullTranscript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join(' ');
      
      setTranscript(fullTranscript.trim());
    };
    
    recognition.onerror = (event) => {
      // The 'no-speech' error is common when the microphone is on but no sound is detected.
      // We can treat this as a non-critical event and simply allow the recognition to stop
      // without cluttering the console with errors. This provides a smoother user experience.
      if (event.error !== 'no-speech') {
        console.error('Speech recognition error', event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript(''); // Clear previous transcript
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };
  
  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport: !!SpeechRecognitionAPI,
  };
};