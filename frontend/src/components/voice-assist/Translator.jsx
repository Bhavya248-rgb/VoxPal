import React, { useState, useEffect } from 'react';
import PremiumBanner from '../common/PremiumBanner';

const languages = [
    { code: 'en-IN', name: 'English' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'ru-RU', name: 'Russian' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'bn-IN', name: 'Bengali' },
    { code: 'ta-IN', name: 'Tamil' },
    { code: 'pt-BR', name: 'Portuguese' },
    { code: 'nl-NL', name: 'Dutch' },
    { code: 'el-GR', name: 'Greek' },
    { code: 'pl-PL', name: 'Polish' },

];

const MAX_VOICE_USES = 2;

const Translator = ({ isPremium, userId }) => {
    const [inputText, setInputText] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('es-ES');
    const [translatedText, setTranslatedText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [recentTranslations, setRecentTranslations] = useState([]);
    const [enableVoice, setEnableVoice] = useState(false);

    // Helper function to get user-specific localStorage key
    const getVoiceUsageKey = () => `voiceUsage_${userId}`;

    const [voiceUsesLeft, setVoiceUsesLeft] = useState(() => {
        if (!userId) return MAX_VOICE_USES; // If no userId, return max uses

        const today = new Date().toDateString();
        const savedData = JSON.parse(localStorage.getItem(getVoiceUsageKey()) || '{}');
        if (savedData.date === today) {
            return MAX_VOICE_USES - (savedData.uses || 0);
        }
        return MAX_VOICE_USES;
    });

    useEffect(() => {
        if (!userId) return; // Don't proceed if no userId

        // Reset voice uses at the start of each day
        const today = new Date().toDateString();
        const savedData = JSON.parse(localStorage.getItem(getVoiceUsageKey()) || '{}');
        if (savedData.date !== today) {
            localStorage.setItem(getVoiceUsageKey(), JSON.stringify({ date: today, uses: 0 }));
            setVoiceUsesLeft(MAX_VOICE_USES);
        }

        // Disable voice if no uses left
        if (voiceUsesLeft <= 0 && !isPremium) {
            setEnableVoice(false);
        }
    }, [voiceUsesLeft, isPremium, userId]);

    const updateVoiceUsage = () => {
        if (isPremium || !userId) return; // Don't track usage for premium users or if no userId
        
        const today = new Date().toDateString();
        const currentUsage = JSON.parse(localStorage.getItem(getVoiceUsageKey()) || '{}');
        const newUses = (currentUsage.uses || 0) + 1;
        localStorage.setItem(getVoiceUsageKey(), JSON.stringify({ date: today, uses: newUses }));
        setVoiceUsesLeft(MAX_VOICE_USES - newUses);
    };

    const handleTranslate = async () => {
        if (!inputText.trim()) return;
        
        if (!isPremium && inputText.length > 100) {
            alert('Free users can translate up to 100 characters. Upgrade to premium for unlimited translation!');
            return;
        }

        // Check voice usage before proceeding
        if (enableVoice && !isPremium && voiceUsesLeft <= 0) {
            alert('You have reached your daily limit for voice translations. Upgrade to premium for unlimited voice translations!');
            setEnableVoice(false);
            return;
        }

        setIsTranslating(true);
        try {
            const response = await fetch('http://localhost:7000/api/voice-assist/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    text: inputText,
                    targetLanguage,
                    convertToSpeech: enableVoice
                })
            });

            const data = await response.json();
            console.log("Data:",data);
            if (!response.ok) throw new Error(data.message || 'Translation failed');

            setTranslatedText(data.translatedText);
            if (data.audioUrl) {
                setAudioUrl(data.audioUrl);
                updateVoiceUsage();
            }
            
            // Add to recent translations if premium
            if (isPremium) {
                setRecentTranslations(prev => [{
                    original: inputText,
                    translated: data.translatedText,
                    language: targetLanguage
                }, ...prev.slice(0, 4)]); // Keep last 5 translations
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsTranslating(false);
        }
    };

    const saveTranslation = () => {
        if (!isPremium) {
            alert('Saving translations is a premium feature. Upgrade to save and access your translation history!');
            return;
        }
        // This feature can be implemented later with a database
        alert('Save feature will be implemented in the next update!');
    };

    return (
        <>
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Enter text to translate..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[150px]"
                        />
                        {!isPremium && (
                            <p className="text-sm text-gray-600 mt-1">
                                Free users: Up to 100 characters. {100 - inputText.length} remaining.
                            </p>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="relative">
                            <select
                                value={targetLanguage}
                                onChange={(e) => setTargetLanguage(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
                            >
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                            <div className="min-h-[150px] p-4 border border-gray-300 rounded-lg bg-gray-50">
                                {isTranslating ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-500">Translating...</p>
                                    </div>
                                ) : (
                                    translatedText || (
                                        <p className="text-gray-400">Translation will appear here...</p>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={enableVoice}
                            onChange={(e) => {
                                if (e.target.checked && !isPremium && voiceUsesLeft <= 0) {
                                    alert('You have reached your daily limit for voice translations. Upgrade to premium for unlimited voice translations!');
                                    return;
                                }
                                setEnableVoice(e.target.checked);
                            }}
                            disabled={!isPremium && voiceUsesLeft <= 0}
                            className="form-checkbox text-purple-600"
                        />
                        <span className={(!isPremium && voiceUsesLeft <= 0) ? 'text-gray-400' : ''}>
                            Enable Voice
                        </span>
                    </label>
                    {!isPremium && (
                        <span className="text-sm text-gray-600">
                            {voiceUsesLeft} voice translations remaining today
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleTranslate}
                        disabled={!inputText.trim() || isTranslating}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                            !inputText.trim() || isTranslating
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                    >
                        {isTranslating ? 'Translating...' : 'Translate'}
                    </button>
                    {translatedText && (
                        <button
                            onClick={saveTranslation}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Save
                        </button>
                    )}
                </div>
            </div>

            {audioUrl && (
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-semibold text-purple-900 mb-4">Audio Output</h3>
                    <audio controls className="w-full">
                        <source src={audioUrl} type="audio/mp3" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}

            {isPremium && recentTranslations.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-semibold text-purple-900 mb-4">Recent Translations</h3>
                    <div className="space-y-2">
                        {recentTranslations.map((translation, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">{translation.original}</p>
                                <p className="text-sm font-medium">{translation.translated}</p>
                                <p className="text-xs text-gray-500">To: {languages.find(l => l.code === translation.language)?.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <PremiumBanner message="Get unlimited voice translations with Premium!" isPremium={isPremium} />
        </>
    );
};

export default Translator; 