import React, { useState, useRef } from 'react';
import PremiumBanner from '../common/PremiumBanner';
import { useVoice } from '../../context/VoiceContext';
import config from '../../config';

const Summarizer = ({ isPremium }) => {
    const [inputType, setInputType] = useState('text'); // 'text', 'url', or 'file'
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [summary, setSummary] = useState('');
    const [originalText, setOriginalText] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [summaryLength, setSummaryLength] = useState('medium');
    const [convertToSpeech, setConvertToSpeech] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);
    const { generalVoiceId } = useVoice();

    const handleInputTypeChange = (type) => {
        if (type === 'url' && !isPremium) {
            alert('URL summarization is a premium feature. Please upgrade to access this feature!');
            return;
        }
        setInputType(type);
        // Clear other inputs
        setUrl('');
        setText('');
        setUploadedFile(null);
        // Clear results
        setSummary('');
        setOriginalText('');
        setIsPlaying(false);
        setProgress(0);
    };

    const handleSummarize = async () => {
        setIsProcessing(true);
        try {
            let endpoint;
            let data;
            let result;
            switch(inputType) {
                case 'file':
                    endpoint = 'summarize-file';
                    const formData = new FormData();
                    formData.append('file', uploadedFile);
                    formData.append('maxLength', summaryLength);
                    // Convert boolean to string explicitly
                    formData.append('convertToSpeech', String(convertToSpeech));
                    formData.append('voiceId', generalVoiceId);

                    const response = await fetch(`${config.apiUrl}/voice-assist/${endpoint}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: formData
                    });
                    
                    result = await response.json();
                    if (!response.ok) throw new Error(result.message);
                    
                    // setSummary(result.summary);
                    // setOriginalText(result.originalText);
                    // if (result.audioUrl) setAudioUrl(result.audioUrl);
                    break;
                    
                default: // text
                    endpoint = 'summarize';
                    data = { text };
                    
                    const textResponse = await fetch(`${config.apiUrl}/voice-assist/${endpoint}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                            ...data,
                            maxLength: summaryLength,
                            convertToSpeech,
                            voiceId: generalVoiceId
                        })
                    });

                    result = await textResponse.json();
                    if (!textResponse.ok) throw new Error(result.message);

                    break;
                    // setSummary(result.summary);
                    // if (result.originalText) setOriginalText(result.originalText);
                    // if (result.audioUrl) setAudioUrl(result.audioUrl);
            }
            setSummary(result.summary);
            if (result.originalText) setOriginalText(result.originalText);
            // if (result.audioUrl) setAudioUrl(result.audioUrl);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!isPremium && file.size > 1000000) {
                alert('Free users can only upload files up to 1MB. Upgrade to premium for unlimited file size!');
                return;
            }
            setUploadedFile(file);
        }
    };

    const canSubmit = () => {
        switch(inputType) {
            case 'url':
                return isPremium && url.trim() !== '';
            case 'file':
                return uploadedFile !== null;
            default:
                return text.trim() !== '';
        }
    };

    const playAudio = async () => {
        if (!summary || isPlaying) return;

        try {
            const response = await fetch(`${config.apiUrl}/storyteller/stream-audio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    text: summary,
                    voiceId: generalVoiceId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate audio');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
                setIsPlaying(true);
            }

            // Clean up the blob URL when audio ends
            audioRef.current.onended = () => {
                URL.revokeObjectURL(url);
                setIsPlaying(false);
                setProgress(0);
            };
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    const handlePlay = () => {
        playAudio();
    };

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setProgress(0);
        }
    };

    return (
        <>
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-900">Input Method</h3>
                <div className="flex space-x-4">
                    <button
                        onClick={() => handleInputTypeChange('text')}
                        className={`px-4 py-2 rounded-lg ${
                            inputType === 'text'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Direct Text
                    </button>
                    <button
                        onClick={() => handleInputTypeChange('url')}
                        className={`px-4 py-2 rounded-lg ${
                            inputType === 'url'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } relative group`}
                    >
                        URL
                        {!isPremium && (
                            <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs px-1 rounded-full">
                                PRO
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => handleInputTypeChange('file')}
                        className={`px-4 py-2 rounded-lg ${
                            inputType === 'file'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        File Upload
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-900">Summary Options</h3>
                <div className="flex space-x-4">
                    <select
                        value={summaryLength}
                        onChange={(e) => setSummaryLength(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="short">Short (2-3 sentences)</option>
                        <option value="medium">Medium (4-5 sentences)</option>
                        <option value="long">Long (6-8 sentences)</option>
                    </select>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={convertToSpeech}
                            onChange={(e) => setConvertToSpeech(e.target.checked)}
                            className="form-checkbox text-purple-600"
                        />
                        <span>Enable Voice</span>
                    </label>
                </div>
            </div>

            <div className="space-y-4">
                {inputType === 'text' && (
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type or paste text here to summarize..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                    />
                )}

                {inputType === 'url' && isPremium && (
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter webpage URL"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                )}

                {inputType === 'file' && (
                    <div className="space-y-2">
                        <input
                            type="file"
                            accept=".txt,.pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="w-full"
                        />
                        {!isPremium && (
                            <p className="text-sm text-gray-600">
                                Free users: Up to 1MB files. Upgrade for unlimited size!
                            </p>
                        )}
                    </div>
                )}

                <button
                    onClick={handleSummarize}
                    disabled={!canSubmit() || isProcessing}
                    className={`w-full px-4 py-2 rounded-lg transition-colors ${
                        canSubmit() && !isProcessing
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {isProcessing ? 'Processing...' : 'Summarize'}
                </button>
            </div>

            {(summary || originalText) && (
                <div className="border-t border-gray-200 pt-6 space-y-4">
                    <h3 className="text-xl font-semibold text-purple-900">Results</h3>
                    {originalText && (
                        <div className="space-y-2">
                            <h4 className="font-medium">Original Text:</h4>
                            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                                {originalText}
                            </p>
                        </div>
                    )}
                    {summary && (
                        <div className="space-y-2">
                            <h4 className="font-medium">Summary:</h4>
                            <p className="text-gray-800 bg-purple-50 p-4 rounded-lg">
                                {summary}
                            </p>
                        </div>
                    )}
                    {summary && convertToSpeech && (
                        <div className="mt-4 space-y-2">
                            <h4 className="font-medium">Audio Controls:</h4>
                            <div className="flex space-x-4">
                                <button
                                    onClick={handlePlay}
                                    disabled={isPlaying}
                                    className={`px-4 py-2 rounded-lg ${
                                        isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                                >
                                    Play
                                </button>
                                <button
                                    onClick={handlePause}
                                    disabled={!isPlaying}
                                    className={`px-4 py-2 rounded-lg ${
                                        !isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                                >
                                    Pause
                                </button>
                                <button
                                    onClick={handleStop}
                                    disabled={!isPlaying}
                                    className={`px-4 py-2 rounded-lg ${
                                        !isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                                >
                                    Stop
                                </button>
                            </div>
                            <audio ref={audioRef} className="hidden" />
                        </div>
                    )}
                </div>
            )}
        </div>
        <PremiumBanner message="Upgrade to summarize any article,blog or news directly from its URL!" isPremium={isPremium} />
        </>
    );
};

export default Summarizer; 
