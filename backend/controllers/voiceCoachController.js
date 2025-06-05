import { GoogleGenerativeAI } from '@google/generative-ai';
import VoiceSession from '../models/voiceSessionModel.js';
import User from '../models/userModel.js';
import { convertSpeechToText } from '../services/speechService.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Helper Functions
const cleanText = (text) => {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^\d+\.\s*/gm, '')
    .replace(/\s*\d+\s*[.]\s*$/, '')
    .replace(/^\d+\s*[-–—.]\s*/, '')
    .replace(/(?:^|\n)([A-Za-z]+ Analysis:|Overall Feedback:|Strengths:|Areas for Improvement:|Specific Recommendations:)/g, '\n\n$1')
    .replace(/([.!?])\s+([A-Z])/g, '$1\n$2')
    .trim();
};

const cleanQuestions = (questions) => {
  return questions
    .filter(q => q.includes('?'))
    .map(q => {
      return q
        .replace(/^\s*\*\s*/, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .trim();
    });
};

const formatSection = (title, content) => {
  const cleanContent = content.replace(new RegExp(`^${title}\\s*`, 'i'), '');
  const paragraphs = cleanContent.split(/\n\n+/).map(p => p.trim());
  return paragraphs.join('\n\n');
};

// Text-to-Speech Helper
const generateSpeech = async (text,voiceId) => {
  let style;
  let multiNativeLocale;
  if(voiceId === "bn-IN-abhik"){
    style = "Conversational";
    multiNativeLocale="en-IN"
  }
  else{
    style = "Narration";
    if(voiceId === "en-US-ronnie" || voiceId === "es-ES-carla" || voiceId === "ta-IN-iniya"){
      multiNativeLocale="en-IN"
    }
    else{
      multiNativeLocale=""
    }
  }

    try {
        const response = await fetch('https://api.murf.ai/v1/speech/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.MURF_API_KEY
            },
            body: JSON.stringify({
                text: text,
                // voice_id: "en-US-terrell",
                voice_id: voiceId,
                style: style,
                multiNativeLocale: multiNativeLocale,
                format: "mp3"
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Murf API error: ${errorData}`);
        }

        const data = await response.json();
        
        if (!data.audioFile) {
            throw new Error('No audio URL in response');
        }

        return { audio_url: data.audioFile };
    } catch (error) {
        console.error('Error in generateSpeech:', error);
        throw error;
    }
};

// Main Controller Functions
const convertSpeechToTextController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }

    const text = await convertSpeechToText(req.file.buffer);
    res.json({ text });
  } catch (err) {
    console.error('Error in speech conversion:', err);
    res.status(500).json({ message: 'Failed to convert speech to text', error: err.message });
  }
};

const generateFeedbackHelper = async (speechText, speechType, audienceType) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `As an expert speech coach, analyze the following ${speechType} intended for a ${audienceType}. 
    Provide a detailed but concise analysis in the following format:

    Analysis:
    Content Analysis:
    - Theme and key messages
    - Target audience relevance

    under Overall Feedback: give STrength and Areas of improvements in two different paragraphs
    Strengths:
    - List key strengths

    Areas for Improvement:
    - List areas needing work

    Potential Audience Questions:
    (4-5 likely questions)

    Scoring:
    - Clarity (1-10)
    - Engagement (1-10)
    - Structure (1-10)
    - Delivery (1-10)

    Speech Text:
    ${speechText}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    });

    const response = await result.response;
    const analysis = response.text();
    
    const transcriptAnalysis = cleanText(
      analysis.match(/Analysis:(.*?)(?=Overall Feedback:|$)/s)?.[1]?.trim() || 'Analysis not available'
    );

    const overallFeedback = cleanText(
      analysis.match(/Overall Feedback:(.*?)(?=Potential Audience Questions:|$)/s)?.[1]?.trim() || 'Feedback not available'
    );

    const questionsMatch = analysis.match(/Potential Audience Questions:(.*?)(?=Scoring:|$)/s)?.[1]?.trim() || '';
    const questions = cleanQuestions(questionsMatch.split('\n'));

    const scoringSection = analysis.match(/Scoring:(.*?)(?=Speech Text:|$)/s)?.[0] || '';
    
    const scores = {
      clarity: parseInt(scoringSection?.match(/Clarity:.*?(\d+)/)?.[1] || '7'),
      engagement: parseInt(scoringSection?.match(/Engagement:.*?(\d+)/)?.[1] || '7'),
      structure: parseInt(scoringSection?.match(/Structure:.*?(\d+)/)?.[1] || '7'),
      delivery: parseInt(scoringSection?.match(/Delivery:.*?(\d+)/)?.[1] || '7')
    };

    return {
      transcriptAnalysis: formatSection('Analysis', transcriptAnalysis),
      questions,
      overallFeedback: formatSection('Overall Feedback', overallFeedback),
      scores
    };
  } catch (error) {
    console.error('Error generating feedback:', error);
    throw error;
  }
};

const generateFeedbackController = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { audienceType, speechType, speechText, recordedAudioUrl,voiceId } = req.body;

    const feedback = await generateFeedbackHelper(speechText, speechType, audienceType);

    let feedbackAudioData;
    if (user.isPremium) {
      const murfText = `Here's your speech analysis for your ${speechType} intended for ${audienceType}.
      
      First, let's discuss the content analysis: ${feedback.transcriptAnalysis}
      
      Here are some questions your audience might ask: ${feedback.questions.join('. ')}
      
      Overall feedback: ${feedback.overallFeedback}
      
      Your scores are:
      Clarity: ${feedback.scores.clarity} out of 10.
      Engagement: ${feedback.scores.engagement} out of 10.
      Structure: ${feedback.scores.structure} out of 10.
      Delivery: ${feedback.scores.delivery} out of 10.`;

      feedbackAudioData = await generateSpeech(murfText,voiceId);
    } else {
      const murfText = `Here's your speech analysis for your ${speechType}.
      
      ${feedback.transcriptAnalysis}
      
      Please check below for potential audience questions and overall feedback.`;

      feedbackAudioData = await generateSpeech(murfText,voiceId);
    }

    let canSave = true;
    let limitMessage = null;
    if (!user.isPremium) {
      const sessionCount = await VoiceSession.countDocuments({ user: user._id });
      if (sessionCount >= 2) {
        canSave = false;
        limitMessage = 'Free session limit reached. Click save only if you want to replace an existing session. Upgrade to premium for unlimited saves!';
      }
    }

    // await User.findByIdAndUpdate(
    //   req.user._id,
    //   { $inc: { TotalSpeeches: 1 } },
    //   { new: true }
    // );

    res.json({
      canSave,
      limitMessage,
      feedback: {
        analysis: feedback.transcriptAnalysis,
        questions: feedback.questions,
        overallFeedback: feedback.overallFeedback,
        scores: user.isPremium ? feedback.scores : {},
        feedbackAudioUrl: feedbackAudioData.audio_url,
        reactions: user.isPremium ? [
          'Your opening effectively grabbed attention',
          'The language level was well-suited for the audience',
          'Strong conclusion with clear call to action'
        ] : []
      }
    });
  } catch (err) {
    console.error('Error generating feedback:', err);
    res.status(500).json({ message: 'Error generating feedback', error: err.message });
  }
};

const saveSessionController = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isPremium) {
      const sessionCount = await VoiceSession.countDocuments({ user: user._id });
      if (sessionCount >= 2) {
        return res.status(403).json({ 
          message: 'Free session limit reached. Please upgrade to premium for unlimited saves.',
          limitReached: true
        });
      }
    }

    const { 
      audienceType, 
      speechType, 
      speechText, 
      recordedAudioUrl,
      feedback 
    } = req.body;

    const session = new VoiceSession({
      user: user._id,
      audienceType,
      speechType,
      speechText,
      recordedAudioUrl,
      feedback: {
        analysis: feedback.analysis,
        questions: feedback.questions,
        overallFeedback: feedback.overallFeedback,
        reactions: user.isPremium ? [
          'Your opening effectively grabbed attention',
          'The language level was well-suited for the audience',
          'Strong conclusion with clear call to action'
        ] : [],
        scores: user.isPremium ? feedback.scores : {},
        feedbackAudioUrl: feedback.feedbackAudioUrl
      }
    });

    await session.save();
    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { TotalSpeeches: 1 } },
      { new: true }
    );
    res.json({ 
      message: 'Session saved successfully',
      session 
    });
  } catch (err) {
    console.error('Error saving session:', err);
    res.status(500).json({ message: 'Error saving session', error: err.message });
  }
};

const getSessionsController = async (req, res) => {
  try {
    const sessions = await VoiceSession.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteSessionController = async (req, res) => {
  try {
    const session = await VoiceSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.user.toString() !== req.user._id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await VoiceSession.findByIdAndDelete(req.params.id);
    res.json({ message: 'Session removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  convertSpeechToTextController,
  generateFeedbackController,
  saveSessionController,
  getSessionsController,
  deleteSessionController
};