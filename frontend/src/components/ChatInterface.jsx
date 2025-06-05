import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FaRobot, FaTimes, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import axiosInstance, { makeStreamRequest } from '../services/axiosService';

const ChatInterface = ({ mode = 'widget' }) => {
    const [isOpen, setIsOpen] = useState(mode === 'fullscreen');
    const [message, setMessage] = useState('');
    const [conversations, setConversations] = useState([{
        type: 'assistant',
        message: 'How can I help you today?',
        isComplete: true
    }]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [conversationsRemaining, setConversationsRemaining] = useState(null);
    const chatEndRef = useRef(null);
    const audioRef = useRef(null);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isOpen) {
            checkRemainingConversations();
        }
    }, [isOpen]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversations]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted;
            if (isMuted && isPlaying) {
                audioRef.current.pause();
            }
        }
    }, [isMuted]);

    const checkRemainingConversations = async () => {
        try {
            const response = await axiosInstance.get('/api/voice-chat/history');
            setConversationsRemaining(response.data.conversationsRemaining);
        } catch (error) {
            console.error('Error checking remaining conversations:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsLoading(true);
        const currentMessage = message;
        setMessage('');

        // Add user message immediately
        setConversations(prev => [...prev, {
            type: 'user',
            message: currentMessage
        }]);

        try {
            const response = await makeStreamRequest('/api/voice-chat/stream', {
                method: 'POST',
                body: JSON.stringify({ message: currentMessage })
            });
            console.log("Response received in chat interface:",response);
            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let currentResponse = '';

            // Add a new assistant message placeholder
            setConversations(prev => [...prev, {
                type: 'assistant',
                message: '',
                isComplete: false
            }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const events = chunk.split('\n\n').filter(Boolean);

                for (const event of events) {
                    if (event.startsWith('data: ')) {
                        const data = JSON.parse(event.slice(6));
                        
                        switch (data.type) {
                            case 'text':
                                currentResponse += data.content;
                                setConversations(prev => {
                                    const newConv = [...prev];
                                    const lastIndex = newConv.length - 1;
                                    if (lastIndex >= 0 && !newConv[lastIndex].isComplete) {
                                        newConv[lastIndex] = {
                                            type: 'assistant',
                                            message: currentResponse,
                                            isComplete: false
                                        };
                                    }
                                    return newConv;
                                });
                                break;

                            case 'complete':
                                // Update final text and play audio if available
                                setConversations(prev => {
                                    const newConv = [...prev];
                                    const lastIndex = newConv.findIndex(c => c.type === 'assistant' && !c.isComplete);
                                    if (lastIndex >= 0) {
                                        newConv[lastIndex] = {
                                            type: 'assistant',
                                            message: data.content.fullText,
                                            isComplete: true
                                        };
                                    }
                                    return newConv;
                                });

                                setConversationsRemaining(data.content.conversationsRemaining);
                                console.log('Data content:', data.content);
                                console.log('Muted or not ', isMuted);
                                // Play audio if available and not muted
                                if (data.content.audioUrl && !isMuted) {
                                    console.log('Audio will play');
                                    try {
                                        const audio = new Audio(data.content.audioUrl);
                                        audioRef.current = audio;
                                        
                                        audio.addEventListener('canplaythrough', () => {
                                            try {
                                                console.log('Audio ready to play');
                                                setIsPlaying(true);
                                                const playPromise = audio.play();
                                                if (playPromise !== undefined) {
                                                    playPromise
                                                        .then(() => {
                                                            console.log('Audio playing');
                                                        })
                                                        .catch(error => {
                                                            console.error('Playback failed:', error);
                                                            setIsPlaying(false);
                                                            toast.error('Audio playback failed. Please check your browser settings.');
                                                        });
                                                }
                                            } catch (error) {
                                                console.error('Error playing audio:', error);
                                                setIsPlaying(false);
                                                toast.error('Failed to play audio response');
                                            }
                                        });
                                        
                                        audio.addEventListener('ended', () => {
                                            setIsPlaying(false);
                                            console.log('Audio playback completed');
                                        });
                                        
                                        audio.addEventListener('error', (e) => {
                                            console.error('Audio playback error:', e);
                                            setIsPlaying(false);
                                        });
                                    } catch (error) {
                                        console.error('Error creating audio:', error);
                                        setIsPlaying(false);
                                        toast.error('Failed to process audio response');
                                    }
                                }
                                break;

                            case 'error':
                                throw new Error(data.content);
                        }
                    }
                }
            }
        } catch (error) {
            if (error.message.includes('status: 401')) {
                toast.error('Session expired. Please login again.');
            } else {
                toast.error('Failed to send message. Please try again.');
            }
            console.error('Error sending message:', error);
            
            // Remove the last message if there was an error
            setConversations(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    // If widget is closed and mode is widget, show only the button
    if (mode === 'widget' && !isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white rounded-full p-4 shadow-lg hover:bg-gray-800 transition-colors"
            >
                <FaRobot size={24} />
            </button>
        );
    }

    const containerClassName = mode === 'widget'
        ? "fixed bottom-4 right-4 z-50 w-96 max-h-[600px] flex flex-col bg-gray-900 rounded-lg shadow-xl border border-gray-700"
        : "flex flex-col h-screen bg-gray-900";

    return (
        <div className={containerClassName}>
            <div className="bg-gray-800 text-white p-4 rounded-t-lg flex justify-between items-center border-b border-gray-700">
                <h3 className="font-semibold">TalkMate</h3>
                <div className="flex gap-2">
                    {(conversationsRemaining > 0 || isPlaying) && (
                        <button onClick={toggleMute} className="hover:text-gray-300">
                            {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                        </button>
                    )}
                    {mode === 'widget' && (
                        <button onClick={() => setIsOpen(false)} className="hover:text-gray-300">
                            <FaTimes size={20} />
                        </button>
                    )}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
                {conversations.map((conv, index) => (
                    <div key={index} className="space-y-2">
                        {conv.type === 'user' ? (
                            <div className="flex justify-end">
                                <div className="bg-indigo-600 text-white rounded-lg p-2 max-w-[80%]">
                                    {conv.message}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 text-gray-100 rounded-lg p-2 max-w-[80%] markdown-content">
                                    <ReactMarkdown>
                                        {conv.message}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 text-gray-100 rounded-lg p-2">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {user && !user.isPremium && conversationsRemaining !== null && (
                <div className="px-4 py-2 text-sm text-gray-300 border-t border-gray-700 bg-gray-800">
                    {conversationsRemaining > 0 ? (
                        `${conversationsRemaining} voice conversations remaining today`
                    ) : (
                        'Voice conversations limit reached for today'
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-gray-800">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 p-2 bg-gray-700 text-white border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-gray-400"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !message.trim()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatInterface; 