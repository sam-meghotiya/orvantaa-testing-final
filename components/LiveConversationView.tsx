
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
                systemInstruction: `You are Orvantaa, a friendly and concise study AI. Your goal is to provide clear, direct, and easy-to-understand answers.

**CRITICAL STYLE RULE: You MUST follow these specific formatting rules in all your responses:**

*   **Emoji Usage:** Enhance your answer by including one or two relevant and helpful emojis. For example, use a brain emoji 🧠 for a complex topic or a lightbulb emoji 💡 for a new idea. Choose emojis that genuinely add value and match the tone of the answer.
*   **Symbol Usage:**
    *   When providing an example or describing a diagram, use: 📊
    *   When giving a reminder, use: 🔔
    *   When listing key points, start each point with a bullet: •

---

**General Response Guidelines (Apply these to every response):**
1.  **Be Direct:** Start with the most important information or a direct answer.
2.  **Be Concise:** Explain concepts clearly but briefly. Use simple language.
3.  **Use Structure:** Use bullet points or short numbered lists for key information.
4.  **Emphasize Key Terms:** Use Markdown bolding (e.g., **word**) to highlight the most important concepts or keywords. Do this appropriately to add clarity.
5.  **Stay Relevant:** Only provide information that directly answers the question.
6.  **Concluding Question:** After fully answering the user's query, end your response with a single, relevant follow-up question to encourage further thought.`,
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
            {transcript.filter(t => t.text.trim()).map((t, i) => (
                <div key={i} className={`flex items-start gap-3 w-full ${t.source === 'user' ? 'justify-end' : ''}`}>
                    {t.source === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"><AiSparkleIcon width={20} height={20}/></div>}
                    <div className={`p-3 rounded-2xl max-w-sm ${t.source === 'user' ? 'bg-white/10 text-white' : 'bg-transparent text-gray-400'}`}>
                        {t.text}
                    </div>
                </div>
            ))}
            {currentTurn.user.trim() && (
                 <div className="flex items-start gap-3 w-full justify-end">
                    <div className="p-3 rounded-2xl max-w-sm bg-white/20 text-white animate-pulse">
                        {currentTurn.user}
                    </div>
                </div>
            )}
             {currentTurn.model.trim() && (
                 <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"><AiSparkleIcon width={20} height={20}/></div>
                    <div className="p-3 rounded-2xl max-w-sm bg-transparent text-gray-300">
                        {currentTurn.model}<span className="inline-block w-2 h-4 bg-white/80 ml-1 animate-pulse"></span>
                    </div>
                </div>
            )}
        </>
    );

    if (!selectedVoice) {
        return (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex flex-col items-center justify-center p-4 animate-fade-in">
                <h2 className="text-3xl font-bold text-white mb-2">Choose a Voice</h2>
                <p className="text-gray-400 mb-8">Select a voice to start your live conversation.</p>
                <div className="flex gap-6">
                    <button onClick={() => handleVoiceSelect('Kore')} className="flex flex-col items-center gap-3 text-white transition-transform hover:scale-105">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"><UserIcon /></div>
                        <span className="font-semibold">Kore (Male)</span>
                    </button>
                     <button onClick={() => handleVoiceSelect('Zephyr')} className="flex flex-col items-center gap-3 text-white transition-transform hover:scale-105">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center"><WomanIcon /></div>
                        <span className="font-semibold">Zephyr (Female)</span>
                    </button>
                </div>
                 <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">&times;</button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-between p-4 animate-fade-in">
             <div className="w-full max-w-4xl text-center pt-8">
                 <p className={`transition-opacity duration-500 ${connectionState === 'connected' ? 'opacity-0' : 'opacity-100'} text-white`}>
                    {statusMessage}
                 </p>
             </div>
             
             <div className="flex-grow w-full max-w-xl flex flex-col items-center justify-center gap-6 relative">
                 <Orb isAnimating={connectionState === 'connected'} />
                 <div className="absolute inset-0 top-auto h-2/3 overflow-y-auto no-scrollbar flex flex-col-reverse">
                    <div>
                        <div className="flex flex-col gap-4 p-4">
                            {renderTranscript()}
                            <div ref={conversationEndRef} />
                        </div>
                    </div>
                 </div>
             </div>

             <div className="w-full max-w-4xl flex items-center justify-center pb-8">
                <button 
                    onClick={handleClose}
                    className="flex items-center justify-center gap-3 bg-red-600 text-white px-8 py-4 rounded-full font-semibold transition-transform hover:scale-105"
                >
                    <StopCircleIcon />
                    <span>End Conversation</span>
                </button>
             </div>
        </div>
    );
};
