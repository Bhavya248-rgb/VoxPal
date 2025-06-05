import React from 'react';

const SaveSession = ({ onSave, disabled, isPremium, savedSessionsCount }) => {
    const handleSave = async () => {
        if (!isPremium && savedSessionsCount >= 2) {
            alert("You've reached your free session limit. Upgrade to continue saving.");
            return;
        }
        onSave();
    };

    return (
        <div className="flex justify-end">
            <button
                onClick={handleSave}
                disabled={disabled || (!isPremium && savedSessionsCount >= 2)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                    disabled || (!isPremium && savedSessionsCount >= 2)
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
            >
                Save Session
            </button>
        </div>
    );
};

export default SaveSession; 