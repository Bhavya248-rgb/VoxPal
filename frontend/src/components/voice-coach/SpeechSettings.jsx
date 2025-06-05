import React from 'react';

const audienceTypes = [
    'School Classmates',
    'Teachers Panel',
    'Parents and Guardians',
    'School Debate Judges',
    'TED Audience',
    'Investors',
    'College Students',
    'Skeptical Panel',
    'Friendly Team'
];

const speechTypes = [
    'Debate',
    'Elocution',
    'School Assembly Speech',
    'Science Fair Explanation',
    'Farewell Speech',
    'Startup Pitch',
    'Interview',
    'Toast',
    'Motivational Talk',
    'Presentation'
];

const proTips = {
    'School Assembly Speech': 'Speak clearly and confidently. Open with a respectful greeting and a strong introduction.',
    'Debate': 'Start with a strong stance. Support each point with logic, examples, or data. Anticipate counterarguments.',
    'Elocution': "Focus on clear pronunciation and expressive delivery. Don't rush, and maintain eye contact.",
    'Science Fair Explanation': "Explain your project like you're teaching a curious friend. Keep it simple but accurate.",
    'Farewell Speech': 'Balance gratitude, memories, and a hopeful message for the future. Keep it warm and sincere.',
    'Startup Pitch': 'Hook your audience in the first 15 seconds with a compelling problem statement.',
    'Interview': 'Use the STAR method (Situation, Task, Action, Result) to structure your responses.',
    'Toast': 'Keep it personal, heartfelt, and under 3 minutes.',
    'Motivational Talk': 'Start with a powerful story that illustrates your main message.',
    'Presentation': 'Follow the rule of three - organize your content into three main points.'
};

const SpeechSettings = ({ selectedAudience, selectedSpeechType, onAudienceChange, onSpeechTypeChange }) => {
    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type of Audience
                    </label>
                    <select
                        value={selectedAudience}
                        onChange={(e) => onAudienceChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        {audienceTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type of Speech
                    </label>
                    <select
                        value={selectedSpeechType}
                        onChange={(e) => onSpeechTypeChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        {speechTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Pro Tip</h3>
                <p className="text-gray-700">{proTips[selectedSpeechType]}</p>
            </div>
        </div>
    );
};

export { audienceTypes, speechTypes };
export default SpeechSettings; 