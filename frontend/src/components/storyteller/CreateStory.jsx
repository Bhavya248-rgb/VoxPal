import React, { useState } from 'react';
import { useVoice } from '../../context/VoiceContext';

const CreateStory = () => {
  const { storyVoiceId } = useVoice();
  console.log("Story id from settings:",storyVoiceId);
  const [formData, setFormData] = useState({
    plot: '',
    numberOfCharacters: 1,
    characters: [{ name: '', description: '' }],
    genre: 'fantasy',
    isConversational: false,
    wordLength: 200 // default word length
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const genres = [
    'fantasy', 'mystery', 'adventure', 'romance', 
    'science fiction', 'fairy tale', 'historical'
  ];

  const wordLengthOptions = [
    { value: 100, label: '100 words (Short)' },
    { value: 200, label: '200 words (Medium)' },
    { value: 400, label: '400 words (Long)' },
    { value: 500, label: '500 words (Premium)' },
    { value: 600, label: '600 words (Premium)' }
  ];

  const handleCharacterChange = (index, field, value) => {
    const updatedCharacters = [...formData.characters];
    updatedCharacters[index] = {
      ...updatedCharacters[index],
      [field]: value
    };
    setFormData({ ...formData, characters: updatedCharacters });
  };

  const handleNumberOfCharactersChange = (e) => {
    const num = parseInt(e.target.value);
    let characters = [...formData.characters];
    
    if (num > characters.length) {
      // Add more character fields
      while (characters.length < num) {
        characters.push({ name: '', description: '' });
      }
    } else {
      // Remove excess character fields
      characters = characters.slice(0, num);
    }

    setFormData({
      ...formData,
      numberOfCharacters: num,
      characters,
      storyVoiceId: storyVoiceId
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedStory(null);

    try {
      const response = await fetch('http://localhost:7000/api/storyteller/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          storyVoiceId: storyVoiceId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isPremiumFeature) {
          setError('⭐ This is a premium feature. Please upgrade to access longer stories!');
        } else {
          throw new Error(data.error || 'Failed to generate story');
        }
        return;
      }

      setGeneratedStory(data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStory = async () => {
    if (!generatedStory) return;

    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:7000/api/storyteller/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: `Story about ${formData.plot.slice(0, 50)}...`,
          content: generatedStory.story,
          audioUrl: generatedStory.audioUrl,
          metadata: {
            plot: formData.plot,
            characters: formData.characters,
            genre: formData.genre,
            wordLength: formData.wordLength,
            isConversational: formData.isConversational,
            source: 'CreateStory'
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-2 sm:mb-4">Create Story</h2>
        <p className="text-base sm:text-lg text-gray-700">Create your own unique story with AI assistance.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="plot" className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
            Plot Idea
          </label>
          <textarea
            id="plot"
            name="plot"
            value={formData.plot}
            onChange={(e) => setFormData({ ...formData, plot: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
            placeholder="Describe your story plot (e.g., A young wizard discovers a mysterious book...)"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="genre" className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
              Story Genre
            </label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

        <div>
            <label htmlFor="wordLength" className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
              Word Length
          </label>
            <select
              id="wordLength"
              name="wordLength"
              value={formData.wordLength}
              onChange={(e) => setFormData({ ...formData, wordLength: parseInt(e.target.value) })}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {wordLengthOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

              <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
            Characters
                </label>
          <div className="space-y-3">
            {formData.characters.map((char, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="flex-1">
                <input
                  type="text"
                    placeholder="Character name"
                  value={char.name}
                  onChange={(e) => handleCharacterChange(index, 'name', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
                <div className="flex-[2]">
                <input
                  type="text"
                    placeholder="Character description"
                  value={char.description}
                  onChange={(e) => handleCharacterChange(index, 'description', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleNumberOfCharactersChange({ target: { value: formData.numberOfCharacters - 1 } })}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors duration-300"
                >
                  Remove
                </button>
              </div>
            ))}
        </div>
          <button
            type="button"
            onClick={() => handleNumberOfCharactersChange({ target: { value: formData.numberOfCharacters + 1 } })}
            className="mt-2 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-colors duration-300"
          >
            + Add Character
          </button>
        </div>

        {/* <div className="flex items-center gap-2"> */}
          {/* <input
            type="checkbox"
            id="isConversational"
            name="isConversational"
            checked={formData.isConversational}
            onChange={(e) => setFormData({ ...formData, isConversational: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
          /> */}
          {/* <label htmlFor="isConversational" className="text-sm sm:text-base text-gray-700">
            Include character dialogue
          </label> */}
        {/* </div> */}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg text-white font-semibold transition-all duration-300 ${
            loading 
            ? 'bg-purple-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg'
          }`}
        >
          {loading ? 'Generating Story...' : 'Generate Story'}
        </button>
      </form>

      {generatedStory && (
        <div className="mt-8 p-4 sm:p-6 bg-purple-50 rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-purple-900">Your Generated Story</h3>
            <button
              onClick={handleSaveStory}
              disabled={isSaving}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg text-white font-semibold transition-all duration-300 ${
                isSaving 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : saveSuccess
                    ? 'bg-green-500'
                    : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Story'}
            </button>
          </div>
          
          <div className="prose max-w-none">
            {generatedStory.story.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-sm sm:text-base text-gray-700">{paragraph}</p>
            ))}
          </div>
          
          {generatedStory.audioUrl && (
            <div className="mt-4">
              <h3 className="text-base sm:text-lg font-semibold mb-2">Audio Version</h3>
              <audio controls className="w-full max-w-full">
                <source src={generatedStory.audioUrl} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Add Video Story Option */}
          <div className="mt-4 p-4 bg-purple-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-purple-900">Video Story ⭐</h3>
                <p className="text-sm text-gray-600">Transform your story into an animated video</p>
              </div>
              <button
                onClick={() => alert('This is a premium feature. Please upgrade to access video stories!')}
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

export default CreateStory;