import React, { useState, useEffect } from 'react';
import AudioRecorder from '../components/voice-coach/AudioRecorder';
import FileUploader from '../components/voice-coach/FileUploader';
import FeedbackDisplay from '../components/voice-coach/FeedbackDisplay';
import SpeechSettings, { audienceTypes, speechTypes } from '../components/voice-coach/SpeechSettings';
import PremiumBanner from '../components/common/PremiumBanner';
import SaveSession from '../components/voice-coach/SaveSession';
import { useVoice } from '../context/VoiceContext'; 

const VoiceCoach = () => {
  const { generalVoiceId } =  useVoice();
  const [selectedAudience, setSelectedAudience] = useState(audienceTypes[0]);
  const [selectedSpeechType, setSelectedSpeechType] = useState(speechTypes[0]);
  const [speechText, setSpeechText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
    const [savedSessions, setSavedSessions] = useState([]);

  // Check authentication status on component mount
    useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchUserData(token);
            loadSavedSessions(token);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
            const response = await fetch('http://localhost:7000/api/auth/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setIsPremium(userData.isPremium);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

    const loadSavedSessions = async (token) => {
        try {
            const response = await fetch('http://localhost:7000/api/voice/sessions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load sessions');
            }

            const data = await response.json();
            setSavedSessions(data.map(session => ({
                id: session._id,
                audience: session.audienceType,
                speechType: session.speechType,
                date: new Date(session.createdAt).toLocaleDateString(),
                speechText: session.speechText,
                feedback: session.feedback
            })));
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    };

    const handleSaveSession = async () => {
        if (!feedback) {
            alert("Please generate feedback before saving the session.");
            return;
        }

        try {
            const response = await fetch('http://localhost:7000/api/voice/save-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    audienceType: selectedAudience,
                    speechType: selectedSpeechType,
                    speechText,
                    recordedAudioUrl,
                    feedback: {
                        analysis: feedback.transcriptAnalysis,
                        questions: feedback.questions,
                        overallFeedback: feedback.overallFeedback,
                        reactions: isPremium ? [
                            'Your opening effectively grabbed attention',
                            'The language level was well-suited for the audience',
                            'Strong conclusion with clear call to action'
                        ] : [],
                        scores: isPremium ? feedback.scores : {},
                        feedbackAudioUrl: feedback.feedbackAudioUrl
                    }
                })
            });

            if (response.status === 403) {
                alert('You have reached your free session limit. Please upgrade to premium to continue.');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save session');
            }

            const data = await response.json();
            
            const newSession = {
                id: data.session._id,
                audience: selectedAudience,
                speechType: selectedSpeechType,
                date: new Date().toLocaleDateString(),
                speechText,
                feedback: data.session.feedback
            };
            
            setSavedSessions([...savedSessions, newSession]);
            alert('Session saved successfully!');
        } catch (error) {
            console.error('Error saving session:', error);
            alert('Failed to save session. Please try again.');
        }
    };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to use this feature');
      return false;
    }
    return token;
  };

    const handleFileUpload = async (file) => {
    const token = checkAuth();
    if (!token) return;

    try {
      setIsProcessing(true);
            setUploadStatus('Uploading...');
      setSpeechText('');
      setRecordedAudioUrl(null);
      setFeedback(null);
            setIsFileUploaded(false);

      if (file.type.startsWith('audio/')) {
        const audioUrl = URL.createObjectURL(file);
        setRecordedAudioUrl(audioUrl);
                await handleConvertToText(audioUrl);
      } else {
        const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        let text = event.target.result;
                        
                        if (file.type === 'application/pdf') {
                            alert('PDF files are not supported yet. Please use .txt files.');
                            return;
                        } else if (file.type.includes('word')) {
                            alert('Word files are not supported yet. Please use .txt files.');
                            return;
                        }

                        text = text.trim();
                        if (!text) {
                            throw new Error('The file appears to be empty.');
                        }

          setSpeechText(text);
                        setIsFileUploaded(true);
                        setUploadStatus('File uploaded successfully!');
                    } catch (error) {
                        console.error('Error reading file:', error);
                        setUploadStatus('Error reading file. Please try again.');
                        alert(error.message || 'Error reading file. Please try again.');
                    }
                };

                reader.onerror = () => {
                    setUploadStatus('Error reading file. Please try again.');
                    alert('Error reading file. Please try again.');
        };

        reader.readAsText(file);
      }
    } catch (error) {
      console.error('Error processing file:', error);
            setUploadStatus('Error uploading file. Please try again.');
      alert('Error processing file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

    const handleConvertToText = async (audioUrl) => {
        if (!audioUrl) return;

    const token = checkAuth();
    if (!token) return;

    try {
            const audioBlob = await fetch(audioUrl).then(r => r.blob());
            const audioFile = new Blob([audioBlob], { type: 'audio/webm' });
      const formData = new FormData();
            formData.append('audio', audioFile, 'speech.webm');
      
      const response = await fetch('http://localhost:7000/api/voice/convert', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to convert speech to text');
      }

      const data = await response.json();
            if (!data.text) {
                throw new Error('No text returned from the server');
            }

      setSpeechText(data.text);
    } catch (error) {
      console.error('Error converting speech to text:', error);
      alert(error.message || 'Failed to convert speech to text. Please try again.');
    }
  };

  const handleGenerateFeedback = async () => {
    if (!speechText) {
            alert('Please upload a file or record speech first.');
      return;
    }

    setIsGeneratingFeedback(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to use this feature.');
        return;
      }
      console.log("Voice id from voice coach:",generalVoiceId);
        const response = await fetch('http://localhost:7000/api/voice/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          audienceType: selectedAudience,
          speechType: selectedSpeechType,
          speechText: speechText.trim(),
          recordedAudioUrl,
          voiceId: generalVoiceId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate feedback');
      }

      const data = await response.json();
            const processedFeedback = {
                transcriptAnalysis: data.feedback?.analysis || '',
                overallFeedback: data.feedback?.overallFeedback || '',
                questions: data.feedback?.questions || [],
                scores: data.feedback?.scores || {},
                feedbackAudioUrl: data.feedback?.feedbackAudioUrl
            };

            setFeedback(processedFeedback);

            if (processedFeedback.feedbackAudioUrl) {
                const audioElement = new Audio(processedFeedback.feedbackAudioUrl);
                audioElement.play().catch(error => {
                    console.error('Error playing audio:', error);
                });
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      alert(error.message || 'Failed to generate feedback. Please try again.');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-2">Voice Coach</h2>
        <p className="text-base sm:text-lg text-gray-700">Perfect your speech with AI-powered feedback</p>
      </div>

            <SpeechSettings
                selectedAudience={selectedAudience}
                selectedSpeechType={selectedSpeechType}
                onAudienceChange={setSelectedAudience}
                onSpeechTypeChange={setSelectedSpeechType}
            />

        <div className="flex justify-center gap-4">
                <FileUploader
                    onFileUpload={handleFileUpload}
                    isFileUploaded={isFileUploaded}
                    uploadStatus={uploadStatus}
                    isProcessing={isProcessing}
                />
                
                <AudioRecorder
                    onRecordingComplete={setRecordedAudioUrl}
                    onConversionStart={() => {
                        setSpeechText('');
                        setFeedback(null);
                    }}
                />
        </div>

            {(speechText || recordedAudioUrl) && !isGeneratingFeedback && (
          <div className="flex justify-center">
            <button
              onClick={handleGenerateFeedback}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              Generate Feedback
            </button>
          </div>
        )}

        {isGeneratingFeedback && (
          <div className="text-center text-gray-600">
            Generating AI feedback...
          </div>
        )}

            <FeedbackDisplay feedback={feedback} isPremium={isPremium} />

        {feedback && (
                <SaveSession
                    onSave={handleSaveSession}
                    disabled={!speechText}
                    isPremium={isPremium}
                    savedSessionsCount={savedSessions.length}
                />
                )}

            <PremiumBanner message="Get access to audience reactions, AI scoring, audio feedback, and unlimited saves!" isPremium={isPremium} />
    </div>
  );
};

export default VoiceCoach; 