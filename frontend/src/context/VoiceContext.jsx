import React, { createContext, useContext, useState, useEffect } from 'react';

const VoiceContext = createContext();

export function VoiceProvider({ children }) {
  const [storyVoiceId, setStoryVoiceId] = useState(() => {
    // Try to get from localStorage first
    const saved = localStorage.getItem('storyVoiceId');
    return saved || 'en-US-ronnie'; // Default to ronnie if nothing saved
  });

  const [generalVoiceId, setGeneralVoiceId] = useState(() => {
    const saved = localStorage.getItem('generalVoiceId');
    return saved || 'bn-IN-abhik'; // Default to abhik if nothing saved
  });

  // Save to localStorage whenever values change
  useEffect(() => {
    localStorage.setItem('storyVoiceId', storyVoiceId);
    localStorage.setItem('generalVoiceId', generalVoiceId);
  }, [storyVoiceId, generalVoiceId]);

  const updateVoicePreferences = (storyId, generalId) => {
    if (storyId) setStoryVoiceId(storyId);
    if (generalId) setGeneralVoiceId(generalId);
  };

  return (
    <VoiceContext.Provider value={{
      storyVoiceId,
      generalVoiceId,
      updateVoicePreferences
    }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}