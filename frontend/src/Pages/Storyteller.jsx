import React, { useState } from 'react';
import UnderstandConcept from '../components/storyteller/UnderstandConcept.jsx';
import CreateStory from '../components/storyteller/CreateStory.jsx';

const options = [
  {
    title: 'Understand The Concept',
    description: 'Turn complex topics into easy-to-understand stories',
    tagline: 'Transform any topic into an engaging story',
  },
  {
    title: 'Create a Story',
    description: 'Generate unique stories with your creative input',
    tagline: 'Coming soon: Your imagination, our magic',
  }
];

const Storyteller = () => {
  const [selectedOption, setSelectedOption] = useState(options[0].title);

  return (
    <div className="min-h-screen relative">
      {/* Fantasy Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ 
          // backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23')`,
          filter: 'brightness(0.8)'
        }}
      />
      
      <div className="relative z-10 max-w-4xl mx-auto pt-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-2xl sm:text-4xl font-bold text-purple-900 mb-2">
            Story Teller
          </h1>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
            VoxPal transforms dry lessons and random thoughts into engaging stories!
          </p>
        </div>

        {/* Navigation Bar */}
        <div className="flex justify-center space-x-4 mb-12">
          {options.map((option) => (
            <button
              key={option.title}
              onClick={() => setSelectedOption(option.title)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedOption === option.title
                ? 'bg-purple-900 text-white shadow-lg scale-105'
                : 'bg-white/90 text-purple-900 hover:bg-purple-100'
              }`}
            >
              {option.title}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="bg-white/90 rounded-2xl p-8 backdrop-blur-sm shadow-xl max-w-3xl mx-auto">
          {selectedOption === 'Understand The Concept' ? (
            <UnderstandConcept />
          ) : selectedOption === 'Create a Story' ? (
            <CreateStory />
          ) : (
            options.map((option) => (
              selectedOption === option.title && (
                <div key={option.title} className="text-center">
                  <h2 className="text-3xl font-bold text-purple-900 mb-4">{option.title}</h2>
                  <p className="text-lg text-gray-700 mb-6">{option.description}</p>
                  <p className="text-xl font-semibold text-purple-600 italic">{option.tagline}</p>
                </div>
              )
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Storyteller;