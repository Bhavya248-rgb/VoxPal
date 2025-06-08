import React, { useState, useEffect } from 'react';
import { useVoice } from '../context/VoiceContext';
import { useNavigate } from 'react-router-dom';

const voiceOptions = {
  storytelling: [
    {
      id: 'story-male',
      name: 'Male-1',
      gender: 'Male',
      voice_id:"en-US-ronnie",
      style:"Narration",
      multiNativeLocale:"en-IN",
      sampleAudio: '/voices/story/ronnie.wav'
    },
    {
      id: 'story-female1',
      name: 'Female-1',
      gender: 'Female',
      voice_id:"ta-IN-iniya",
      style:"Narration",
      multiNativeLocale:"en-IN",
      sampleAudio: '/voices/story/iniya.wav'
    },
    {
      id: 'story-female2',
      name: 'Female-2',
      gender: 'Female',
      voice_id:"en-US-julia",
      style:"Narration",
      sampleAudio: '/voices/story/julia.wav'
    }
  ],
  features: {
    male: [
      {
        id: 'male-1',
        name: 'Male-1',
        age:'Young Adult',
        voice_id:"bn-IN-abhik",
        style:"Conversational",
        multiNativeLocale:"en-IN",
        sampleAudio: '/voices/abhik.wav'
      },
      {
        id: 'male-2',
        name: 'Male-2',
        age: 'Middle Aged',
        voice_id:"en-IN-eashwar",
        style:"Narration",
        sampleAudio: '/voices/eashwar.wav'
      },
      {
        id: 'male-3',
        name: 'Male-3',
        age: 'Young Adult',
        voice_id:"en-US-ronnie",
        style:"Narration",
        multiNativeLocales:["en-IN","en-US"],
        sampleAudio: '/voices/ronnie.wav'
      }
    ],
    female: [
      {
        id: 'female-1',
        name: 'Female-1',
        age: 'Young Adult',
        voice_id:"en-US-julia",
        style:"Narration",
        sampleAudio: '/voices/julia.wav'
      },
      {
        id: 'female-2',
        name: 'Female-2',
        age: 'Middle Aged',
        voice_id:"es-ES-carla",
        style:"Narration",
        multiNativeLocale:"en-IN",
        sampleAudio: '/voices/carla.wav'
      },
      {
        id: 'female-3',
        name: 'Female-3',
        age: 'Young',
        voice_id:"ta-IN-iniya",
        style:"Narration",
        multiNativeLocale:"en-IN",
        sampleAudio: '/voices/iniya.wav'
      }
    ]
  }
};

export default function Settings() {
  const navigate = useNavigate();
  const { updateVoicePreferences } = useVoice();
  const [selectedVoice, setSelectedVoice] = useState('story-male');
  const [selectedFeatureVoice, setSelectedFeatureVoice] = useState('male-1');
  const [isPlaying, setIsPlaying] = useState(null);
  const [audioElements, setAudioElements] = useState({});

  // Initialize audio elements
  useEffect(() => {
    const elements = {};
    [...voiceOptions.storytelling, ...voiceOptions.features.male, ...voiceOptions.features.female].forEach(voice => {
      const audio = new Audio(voice.sampleAudio);
      audio.addEventListener('ended', () => setIsPlaying(null));
      elements[voice.id] = audio;
    });
    setAudioElements(elements);

    // Cleanup function
    return () => {
      Object.values(elements).forEach(audio => {
        audio.pause();
        audio.removeEventListener('ended', () => setIsPlaying(null));
      });
    };
  }, []);

  const handleVoiceSelect = (voiceId, isStoryVoice = false) => {
    if (isStoryVoice) {
      setSelectedVoice(voiceId);
    } else {
      setSelectedFeatureVoice(voiceId);
    }
  };

  const handleSavePreferences = () => {
    const storyVoice = voiceOptions.storytelling.find(v => v.id === selectedVoice);
    const featureVoice = [...voiceOptions.features.male, ...voiceOptions.features.female]
      .find(v => v.id === selectedFeatureVoice);

    updateVoicePreferences(storyVoice.voice_id, featureVoice.voice_id);
    alert('Voice preferences saved successfully!');
    navigate(-1);
  };

  const playAudioSample = (voiceId, e) => {
    e.stopPropagation(); // Prevent card selection when clicking play button

    // Stop currently playing audio if any
    if (isPlaying && audioElements[isPlaying]) {
      audioElements[isPlaying].pause();
      audioElements[isPlaying].currentTime = 0;
    }

    // Play new audio
    if (isPlaying !== voiceId) {
      audioElements[voiceId].currentTime = 0;
      audioElements[voiceId].play();
      setIsPlaying(voiceId);
    } else {
      // If clicking the same voice that's playing, stop it
      setIsPlaying(null);
    }
  };

  const VoiceCard = ({ voice, isStoryVoice = false }) => {
    const isSelected = isStoryVoice 
      ? selectedVoice === voice.id 
      : selectedFeatureVoice === voice.id;
    
    return (
      <div 
        className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300
          ${isSelected 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
            : 'bg-white hover:shadow-md'}`}
        onClick={() => handleVoiceSelect(voice.id, isStoryVoice)}
      >
        <span className={`text-lg font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
          {voice.name}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => playAudioSample(voice.id, e)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${isSelected 
                ? 'bg-white text-indigo-600 hover:bg-indigo-50' 
                : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isPlaying === voice.id ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M10 15V9m4 6V9" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                />
              )}
            </svg>
            <span>{isPlaying === voice.id ? 'Stop' : 'Preview'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Voice Settings</h1>
        </div>

        <div className="space-y-12">
          {/* Storytelling Voices */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Storytelling Voices</h2>
            <div className="space-y-4">
              {voiceOptions.storytelling.map((voice) => (
                <VoiceCard key={voice.id} voice={voice} isStoryVoice={true} />
              ))}
            </div>
          </section>

          {/* Other Feature Voices */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">General Assistant Voices</h2>
            <div className="space-y-6">
              {/* Male Voices */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Male Voices</h3>
                <div className="space-y-3">
                  {voiceOptions.features.male.map((voice) => (
                    <VoiceCard key={voice.id} voice={voice} />
                  ))}
                </div>
              </div>
              {/* Female Voices */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Female Voices</h3>
                <div className="space-y-3">
                  {voiceOptions.features.female.map((voice) => (
                    <VoiceCard key={voice.id} voice={voice} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Save Button */}
        <div className="mt-12 text-center">
          <button 
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            onClick={handleSavePreferences}
          >
            Save Voice Preferences
          </button>
        </div>
      </div>
    </div>
  );
} 