import React, { useState, useRef, useEffect } from 'react';
import { useVoice } from '../../context/VoiceContext'
import { useNavigate } from 'react-router-dom';
import config from '../../config';

const ageGroups = [
  '3-5 years',
  '6-8 years',
  '9-12 years',
  '13-16 years',
  '16+ years'
];

const genres = [
  'Adventure',
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Educational',
  'Fairy Tale',
  'Historical',
  'Moral Story'
];

const wordCountOptions = Array.from({ length: 5 }, (_, i) => ({
  value: 100 + (i * 50),
  label: `${100 + (i * 50)} words`
}));

const UnderstandConcept = () => {
  const navigate = useNavigate();
  const { storyVoiceId } = useVoice();
  const [storyForm, setStoryForm] = useState({
    topic: '',
    ageGroup: ageGroups[0],
    genre: genres[0],
    wordCount: wordCountOptions[0].value,
    storyVoiceId: storyVoiceId
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedStory, setGeneratedStory] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const audioRef = useRef(null);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Delete audio file when component unmounts
      if (audioFileName) {
        fetch(`${config.apiUrl}/storyteller/delete-audio/${audioFileName}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).catch(error => console.error('Error deleting audio file:', error));
      }
    };
  }, [audioFileName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedStory('');
    setAudioFileName('');
    
    try {
        const response = await fetch(`${config.apiUrl}/storyteller/concept-to-story`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(storyForm)
        });

        if (!response.ok) {
            throw new Error('Failed to generate story');
        }

        const data = await response.json();
        setGeneratedStory(data.story);
        // if (data.audioUrl) {
            // const fileName = data.audioUrl.split('/').pop();
            // setAudioFileName(fileName);
        // }
        setIsLoading(false);

    } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
    }
  };

  const playAudio = async () => {
    if (!generatedStory || isPlaying) return;

    try {
        console.log("Entered try block in making a call to /stream-audio endpoint");
        const response = await fetch(`${config.apiUrl}/storyteller/stream-audio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                text: generatedStory,
                voiceId: storyForm.storyVoiceId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate audio');
        }
        console.log("Response received from /stream-audio endpoint:",response);
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
        console.log("try ended successfully, audio is playing now");

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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleSaveStory = async () => {
    if (!generatedStory) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${config.apiUrl}/storyteller/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: `Story about ${storyForm.topic}`,
          content: generatedStory,
          audioUrl: '',
          metadata: {
            topic: storyForm.topic,
            ageGroup: storyForm.ageGroup,
            genre: storyForm.genre,
            wordCount: storyForm.wordCount,
            source: 'UnderstandConcept'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save story');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving story:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTakeQuiz = () => {
    navigate('/storyteller/quiz', {
      state: {
        topic: storyForm.topic,
        ageGroup: storyForm.ageGroup,
        wordCount: storyForm.wordCount
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-2 sm:mb-4">Understand The Concept</h2>
        <p className="text-base sm:text-lg text-gray-700">Transform any topic into an engaging story.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
            What topic would you like to learn about?
          </label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={storyForm.topic}
            onChange={handleInputChange}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter a topic (e.g., Photosynthesis, Ancient Egypt)"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="ageGroup" className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
              Age Group
            </label>
            <select
              id="ageGroup"
              name="ageGroup"
              value={storyForm.ageGroup}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {ageGroups.map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
              Story Genre
            </label>
            <select
              id="genre"
              name="genre"
              value={storyForm.genre}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="wordCount" className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
              Word Count
            </label>
            <select
              id="wordCount"
              name="wordCount"
              value={storyForm.wordCount}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {wordCountOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg text-white font-semibold transition-all duration-300 ${
            isLoading 
            ? 'bg-purple-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg'
          }`}
        >
          {isLoading ? 'Generating Story...' : 'Generate Story'}
        </button>
      </form>

      {generatedStory && (
        <div className="mt-8 space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="prose max-w-none">
              {generatedStory.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-sm sm:text-base text-gray-700">{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleTakeQuiz}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Take Quiz
            </button>

            <button
              onClick={handleSaveStory}
              disabled={isSaving}
              className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                saveSuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Story'}
            </button>

            {generatedStory && (
              <div className="flex items-center gap-2">
                {!isPlaying ? (
                  <button
                    onClick={handlePlay}
                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Play Audio
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handlePause}
                      className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Pause
                    </button>
                    <button
                      onClick={handleStop}
                      className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Stop
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Audio Player */}
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnded}
            className="hidden"
          />

          {/* Progress Bar */}
          {isPlaying && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {/* Premium Feature Banner */}
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-purple-900">Educational Video ⭐</h3>
                <p className="text-sm text-gray-600">Convert your educational story into an engaging animated video</p>
              </div>
              <button
                onClick={() => alert('This is a premium feature. Please upgrade to access educational videos!')}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300"
              >
                Upgrade to Get Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnderstandConcept; 