import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenaiBlob } from '@google/genai';
import { Orb } from './Orb.tsx';
import { StopCircleIcon, UserIcon, AiSparkleIcon, WomanIcon } from './icons/Icons.tsx';

// --- Audio Helper Functions (as per Gemini SDK documentation) ---

function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): GenaiBlob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

// --- Component Types ---

type TranscriptEntry = {
    source: 'user' | 'model';
    text: string;
};

interface LiveConversationViewProps {
    onClose: () => void;
    onComplete: (transcript: { user: string; ai: string; }) => void;
}

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error';
type VoiceOption = 'Kore' | 'Zephyr';

// --- Main Component ---

export const LiveConversationView: React.FC<LiveConversationViewProps> = ({ onClose, onComplete }) => {
    const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
    const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
    const [statusMessage, setStatusMessage] = useState('Choose a voice to begin.');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [currentTurn, setCurrentTurn] = useState<{ user: string; model: string }>({ user: '', model: '' });

    const sessionRef = useRef<any>(null);
    const finalTranscriptRef = useRef({ user: '', ai: '' });
    const conversationEndRef = useRef<HTMLDivElement>(null);

    // Audio-related refs
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const handleVoiceSelect = (voice: VoiceOption) => {
        if (navigator.vibrate) navigator.vibrate(5);
        setSelectedVoice(voice);
        setConnectionState('connecting');
    };

    useEffect(() => {
        if (!selectedVoice) return;

        let isMounted = true;
        
        setStatusMessage('Initializing session...');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        inputAudioContextRef.current = inputAudioContext;
        outputAudioContextRef.current = outputAudioContext;

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: async () => {
                    if (!isMounted) return;
                    setStatusMessage('Connecting to microphone...');
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        if (!isMounted) return;
                        setConnectionState('connected');
                        setStatusMessage('Connected. You can start speaking!');
                        audioStreamRef.current = stream;
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    } catch (err) {
                        console.error('Microphone access denied:', err);
                        setConnectionState('error');
                        setStatusMessage('Microphone access is required. Please grant permission and try again.');
                    }
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        setCurrentTurn(prev => ({ ...prev, user: prev.user + message.serverContent.inputTranscription.text }));
                    }
                    if (message.serverContent?.outputTranscription) {
                        setCurrentTurn(prev => ({ ...prev, model: prev.model + message.serverContent.outputTranscription.text }));
                    }

                    if (message.serverContent?.turnComplete) {
                        setTranscript(prev => [...prev, { source: 'user', text: currentTurn.user }, { source: 'model', text: currentTurn.model }]);
                        finalTranscriptRef.current.user += ` ${currentTurn.user}`;
                        finalTranscriptRef.current.ai += ` ${currentTurn.model}`;
                        setCurrentTurn({ user: '', model: '' });
                    }
                    
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && outputAudioContext) {
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                        const sourceNode = outputAudioContext.createBufferSource();
                        sourceNode.buffer = audioBuffer;
                        sourceNode.connect(outputAudioContext.destination);
                        sourceNode.addEventListener('ended', () => audioSourcesRef.current.delete(sourceNode));
                        sourceNode.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioSourcesRef.current.add(sourceNode);
                    }
                    
                    if (message.serverContent?.interrupted) {
                        for (const source of audioSourcesRef.current.values()) {
                            source.stop();
                        }
                        audioSourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }
                },
                onerror: (e: ErrorEvent) => {
                    if (navigator.vibrate) navigator.vibrate([75, 50, 75]);
                    console.error('Live session error:', e, 'This may be due to an invalid API key or network issues.');
                    setConnectionState('error');
                    setStatusMessage('Connection failed. Please check that your API key is valid and try again.');
                },
                onclose: (e: CloseEvent) => {
                    setStatusMessage('Conversation ended.');
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                systemInstruction: "You are Orvantaa, a friendly and helpful AI guide for students. Keep your responses conversational and concise.",
                thinkingConfig: { thinkingBudget: 0 }
            },
        });

        sessionPromise.then(session => {
            if (isMounted) sessionRef.current = session;
        });

        return () => {
            isMounted = false;
            sessionRef.current?.close();
            audioStreamRef.current?.getTracks().forEach(track => track.stop());
            inputAudioContextRef.current?.close();
            outputAudioContextRef.current?.close();
            scriptProcessorRef.current?.disconnect();
        };
    }, [selectedVoice]);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript, currentTurn]);

    const handleClose = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        onComplete(finalTranscriptRef.current);
        onClose();
    };

    const renderTranscript = () => (
        <>
            {transcript.filter(t => t.text.trim()).map((entry, index) => (
                <div key={index} className={`flex items-start gap-3 w-full ${entry.source === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {entry.source === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-green)] to-green-300 flex items-center justify-center text-black"><AiSparkleIcon /></div>}
                    <p className={`px-4 py-2 rounded-2xl max-w-lg ${entry.source === 'user' ? 'bg-white/10 text-white/90' : 'bg-transparent text-white/90'}`}>{entry.text}</p>
                    {entry.source === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"><UserIcon /></div>}
                </div>
            ))}
            {currentTurn.user && (
                 <div className="flex items-start gap-3 w-full justify-end">
                    <p className="px-4 py-2 rounded-2xl max-w-lg bg-white/5 text-white/60">{currentTurn.user}</p>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"><UserIcon /></div>
                </div>
            )}
             {currentTurn.model && (
                 <div className="flex items-start gap-3 w-full justify-start">
                     <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-green)] to-green-300 flex items-center justify-center text-black"><AiSparkleIcon /></div>
                    <p className="px-4 py-2 rounded-2xl max-w-lg bg-transparent text-white/60">{currentTurn.model}</p>
                </div>
            )}
        </>
    );

    if (connectionState === 'idle') {
        return (
            <div className="fixed inset-0 z-50 bg-[var(--bg-main)] flex flex-col items-center justify-center p-4 animate-fade-in gap-8">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-white">Choose a Voice</h2>
                    <p className="text-gray-400 mt-2">Select a voice for your conversation.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Female Voice Card */}
                    <div className="flex flex-col items-center p-8 bg-black/30 border border-white/10 rounded-2xl w-72 transition-all duration-300 hover:border-white/50 hover:shadow-2xl hover:shadow-pink-500/10 transform hover:-translate-y-2">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white ring-4 ring-black/20">
                            <WomanIcon width={56} height={56} />
                        </div>
                        <h3 className="mt-6 text-2xl font-bold text-white">Female Voice</h3>
                        <p className="mt-2 text-sm text-gray-400 text-center h-10">A clear and expressive voice for a natural conversation.</p>
                        <button onClick={() => handleVoiceSelect('Kore')} className="mt-8 w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-300 transition-transform hover:scale-105">
                            Start with Kore
                        </button>
                    </div>
                    {/* Male Voice Card */}
                    <div className="flex flex-col items-center p-8 bg-black/30 border border-white/10 rounded-2xl w-72 transition-all duration-300 hover:border-white/50 hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-2">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white ring-4 ring-black/20">
                            <UserIcon />
                        </div>
                        <h3 className="mt-6 text-2xl font-bold text-white">Male Voice</h3>
                        <p className="mt-2 text-sm text-gray-400 text-center h-10">A calm and deep voice for a thoughtful discussion.</p>
                        <button onClick={() => handleVoiceSelect('Zephyr')} className="mt-8 w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-300 transition-transform hover:scale-105">
                            Start with Zephyr
                        </button>
                    </div>
                </div>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <StopCircleIcon />
                </button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 bg-[var(--bg-main)] flex flex-col items-center justify-between p-4 animate-fade-in">
            <div className="w-full text-center mt-4">
                <p className={`text-sm ${connectionState === 'error' ? 'text-red-400' : 'text-gray-400'}`}>{statusMessage}</p>
            </div>

            <div className="flex flex-col items-center justify-center flex-grow w-full h-full overflow-hidden">
                <Orb isAnimating={connectionState === 'connected'} />
            </div>

            <div className="w-full max-w-4xl h-1/3 overflow-y-auto no-scrollbar">
                 <div className="flex flex-col gap-4 pb-4">
                    {renderTranscript()}
                    <div ref={conversationEndRef} />
                 </div>
            </div>

            <div className="w-full max-w-lg flex flex-col items-center gap-4 py-4">
                 <button 
                    onClick={handleClose}
                    className="flex items-center justify-center gap-3 w-full max-w-xs px-6 py-4 bg-red-600/80 text-white rounded-full text-lg font-semibold hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20"
                 >
                    <StopCircleIcon />
                    <span>End Conversation</span>
                 </button>
            </div>
             <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
        </div>
    );
};