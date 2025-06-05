import React, { useState, useEffect } from 'react';
import Summarizer from '../components/voice-assist/Summarizer';
import Translator from '../components/voice-assist/Translator';

const VoiceAssist = () => {
    const [activeTab, setActiveTab] = useState('summarize');
    const [isPremium, setIsPremium] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Fetch user's premium status and ID
        const checkUserStatus = async () => {
            try {
                const response = await fetch('http://localhost:7000/api/auth/current', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const userData = await response.json();
                    setIsPremium(userData.isPremium);
                    setUserId(userData._id);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        checkUserStatus();
    }, []);

    return (
        <div className="space-y-6 max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-2">VoxBridge</h2>
                <p className="text-base sm:text-lg text-gray-700">Your AI-powered assistant for connecting languages or concepts quickly</p>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('summarize')}
                        className={`flex-1 px-4 py-3 text-sm sm:text-base font-medium ${
                            activeTab === 'summarize'
                                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        Smart Summarizer
                    </button>
                    <button
                        onClick={() => setActiveTab('translate')}
                        className={`flex-1 px-4 py-3 text-sm sm:text-base font-medium ${
                            activeTab === 'translate'
                                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        Smart Translator
                    </button>
                </div>

                <div className="p-4">
                    {activeTab === 'summarize' ? (
                        <Summarizer isPremium={isPremium} />
                    ) : (
                        <Translator isPremium={isPremium} userId={userId} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceAssist; 