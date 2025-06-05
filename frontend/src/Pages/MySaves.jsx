import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MySaves = () => {
    const [savedStories, setSavedStories] = useState([]);
    const [savedFeedbacks, setSavedFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('stories');
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedStory, setSelectedStory] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSavedStories();
        fetchSavedFeedbacks();
    }, []);

    const fetchSavedStories = async () => {
        try {
            const response = await fetch('http://localhost:7000/api/storyteller/saved', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch saved stories');
            }

            const data = await response.json();
            setSavedStories(data.stories || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSavedFeedbacks = async () => {
        try {
            const response = await fetch('http://localhost:7000/api/voice/sessions', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch saved feedback sessions');
            }

            const data = await response.json();
            setSavedFeedbacks(data || []);
        } catch (error) {
            setError(error.message);
            }
    };

    const handleDeleteStory = async (storyId) => {
        if (!window.confirm('Are you sure you want to delete this story?')) return;

        try {
            const response = await fetch(`http://localhost:7000/api/storyteller/saved/${storyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete story');
            }

            setSavedStories(savedStories.filter(story => story._id !== storyId));
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteFeedback = async (feedbackId) => {
        if (!window.confirm('Are you sure you want to delete this feedback session?')) return;

        try {
            const response = await fetch(`http://localhost:7000/api/voice/sessions/${feedbackId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete feedback session');
            }

            setSavedFeedbacks(savedFeedbacks.filter(session => session._id !== feedbackId));
            if (selectedSession?._id === feedbackId) {
                setSelectedSession(null);
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const StoryDetail = ({ story }) => (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-purple-900">{story.title}</h3>
                    <p className="text-gray-600">Created: {new Date(story.createdAt).toLocaleDateString()}</p>
                    {story.metadata && (
                        <div className="mt-2">
                            <p className="text-gray-600">Topic: {story.metadata.topic}</p>
                            <p className="text-gray-600">Age Group: {story.metadata.ageGroup}</p>
                            <p className="text-gray-600">Genre: {story.metadata.genre}</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setSelectedStory(null)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    Close
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <h4 className="text-lg font-semibold text-purple-800 mb-2">Story Content</h4>
                    <div className="prose max-w-none">
                        {story.content.split('\n').map((paragraph, index) => (
                            <p key={index} className="text-gray-700 mb-4">{paragraph}</p>
                        ))}
                    </div>
                </div>

                {story.audioUrl && (
                    <div>
                        <h4 className="text-lg font-semibold text-purple-800 mb-2">Audio Version</h4>
                        <audio src={story.audioUrl} controls className="w-full" />
                    </div>
                )}
            </div>
        </div>
    );

    const FeedbackDetail = ({ session }) => (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-purple-900">{session.speechType}</h3>
                    <p className="text-gray-600">For: {session.audienceType}</p>
                    <p className="text-gray-600">Date: {new Date(session.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                    onClick={() => setSelectedSession(null)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    Close
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <h4 className="text-lg font-semibold text-purple-800 mb-2">Speech Text</h4>
                    <p className="text-gray-700 whitespace-pre-line">{session.speechText}</p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-purple-800 mb-2">Analysis</h4>
                    <p className="text-gray-700 whitespace-pre-line">{session.feedback.analysis}</p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-purple-800 mb-2">Overall Feedback</h4>
                    <p className="text-gray-700 whitespace-pre-line">{session.feedback.overallFeedback}</p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-purple-800 mb-2">Questions</h4>
                    <ul className="list-disc list-inside space-y-2">
                        {session.feedback.questions.map((q, i) => (
                            <li key={i} className="text-gray-700">{q}</li>
                        ))}
                    </ul>
                </div>

                {session.feedback.scores && Object.keys(session.feedback.scores).length > 0 && (
                    <div>
                        <h4 className="text-lg font-semibold text-purple-800 mb-2">Scores</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(session.feedback.scores).map(([key, value]) => (
                                <div key={key} className="bg-purple-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-purple-600">{value}/10</div>
                                    <div className="text-sm text-purple-700 capitalize">{key}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {session.feedback.feedbackAudioUrl && (
                    <div>
                        <h4 className="text-lg font-semibold text-purple-800 mb-2">Audio Feedback</h4>
                        <audio src={session.feedback.feedbackAudioUrl} controls className="w-full" />
                    </div>
                )}
            </div>
            </div>
        );

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600 py-8">{error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => {
                        setActiveTab('stories');
                        setSelectedSession(null);
                        setSelectedStory(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                        activeTab === 'stories'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    My Saved Stories
                </button>
                <button
                    onClick={() => {
                        setActiveTab('feedback');
                        setSelectedSession(null);
                        setSelectedStory(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                        activeTab === 'feedback'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    My Speech Feedback
                </button>
            </div>

            {activeTab === 'stories' ? (
                <div className="space-y-6">
                    {selectedStory ? (
                        <StoryDetail story={selectedStory} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {savedStories.map(story => (
                                <div key={story._id} className="bg-white p-6 rounded-lg shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-semibold text-purple-900">{story.title}</h3>
                                        <button
                                            onClick={() => handleDeleteStory(story._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <p className="text-gray-600 mb-4">
                                        {new Date(story.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-700 mb-4">{story.content.substring(0, 150)}...</p>
                                    <div className="flex justify-between items-center">
                                        <button
                                            onClick={() => setSelectedStory(story)}
                                            className="text-purple-600 hover:text-purple-800 font-medium"
                                        >
                                            View Full Story →
                                        </button>
                                        {story.audioUrl && (
                                            <audio src={story.audioUrl} controls className="w-48" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {selectedSession ? (
                        <FeedbackDetail session={selectedSession} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {savedFeedbacks.map(session => (
                                <div key={session._id} className="bg-white p-6 rounded-lg shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-purple-900">
                                                {session.speechType}
                                            </h3>
                                            <p className="text-sm text-gray-600">For: {session.audienceType}</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(session.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteFeedback(session._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <p className="text-gray-700 mt-2 mb-4">
                                        {session.speechText.substring(0, 100)}...
                                    </p>
                                    <button
                                        onClick={() => setSelectedSession(session)}
                                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        View Full Feedback
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MySaves; 