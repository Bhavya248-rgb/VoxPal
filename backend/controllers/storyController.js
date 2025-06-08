import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Story from '../models/storyModel.js';
import asyncHandler from "express-async-handler";
import User from '../models/userModel.js';
import MurfService from '../services/murfServices.js';
import fs from 'fs';

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to generate story using Gemini
async function generateStoryWithAI(plotIdea, characters, genre, isConversational, wordLength) {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    // Validate word length
    const validWordLengths = [100, 200, 400];
    const premiumWordLengths = [500, 600];

    if (!validWordLengths.includes(wordLength) && !premiumWordLengths.includes(wordLength)) {
        throw new Error('Invalid word length specified');
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const characterDescriptions = characters
                .map((char, index) => `Character ${index + 1}: ${char.name} - ${char.description}`)
                .join('\n');

            const prompt = `Create a ${genre} story based on the following plot idea:
${plotIdea}

Characters:
${characterDescriptions}

Style: ${isConversational ? 'Conversational with dialogue' : 'Narrative'}

Requirements:
- Create an engaging and coherent story with easily understandable words
- Incorporate all the characters meaningfully
- Match the specified genre (${genre})
- Use descriptive language and vivid imagery and easily understandable words
- Include a clear beginning, middle, and end
- Keep the story approximately ${wordLength} words long
${isConversational ? '- Include natural dialogue between characters' : ''}

Please write the story:`;

            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash-lite",
                config: {
                    temperature: 0.7,
                    maxOutputTokens: Math.max(wordLength * 4, 1000),  // Adjust token limit based on word length
                }
            });

            // Generate content
            console.log(`Attempt ${attempt} of ${maxRetries}...`);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("GEMINI RESPONSE:", response);

            const story = response.text().trim();
            const wordCount = story.split(/\s+/).length;

            console.log("STORY:", story);
            return story;

        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);

            if (attempt === maxRetries) {
                throw new Error('Failed to generate story with Gemini after multiple attempts');
            }

            if (error.status === 503) {
                console.log(`Service unavailable, retrying in ${retryDelay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                continue;
            }

            throw error; // For other types of errors, throw immediately
        }
    }
}

// Helper function to generate speech
async function generateSpeech(text, voiceId) {
    console.log("Voice id from generateSpeech:", voiceId);
    const response = await fetch('https://api.murf.ai/v1/speech/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.MURF_API_KEY
        },
        body: JSON.stringify({
            text: text,
            voice_id: voiceId,
            style: "Narration",
            format: "mp3"
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Murf API error: ${JSON.stringify(errorData)}`);
    }

    const audioData = await response.json();
    return audioData;
}

// @desc    Generate a story using AI
// @route   POST /api/storyteller/generate-story
// @access  Public
const generateStory = asyncHandler(async (req, res) => {
    const { plot, characters, genre, isConversational, wordLength, storyVoiceId } = req.body;
    console.log("Voice id from generateStory:", storyVoiceId);
    // Validate required fields
    if (!plot || !characters || !genre || !wordLength) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: plot, characters, genre, or wordLength'
        });
    }

    // Validate premium features
    if (wordLength >= 500) {
        return res.status(403).json({
            success: false,
            error: 'Word length 500+ is a premium feature',
            isPremiumFeature: true
        });
    }

    // Generate the story using Gemini
    // console.log('Generating story with Gemini');
    const story = await generateStoryWithAI(plot, characters, genre, isConversational, wordLength);
    // console.log('Story generated successfully');

    // Generate audio for the story
    let audioData = null;
    if (process.env.MURF_API_KEY) {
        // console.log('Generating audio for the story');
        audioData = await generateSpeech(story, storyVoiceId);
        // console.log('Audio generated successfully');
    }

    try {
        // After successful story generation, increment the user's story count
        await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { TotalStories: 1 } },
            { new: true }
        );

        res.json({
            success: true,
            story: story,
            wordCount: story.split(/\s+/).length,
            ...(audioData && {
                audioUrl: audioData.audioFile,
                audioLength: audioData.audioLengthInSeconds
            })
        });
    } catch (error) {
        res.status(500);
        throw new Error('Story generation failed: ' + error.message);
    }
});

// @desc    Generate a story from concept
// @route   POST /api/storyteller/concept-to-story
// @access  Public
const generateStoryFromConcept = asyncHandler(async (req, res) => {
    const { topic, ageGroup, genre, wordCount, storyVoiceId } = req.body;
    console.log("Voice id from generateStoryFromConcept:", storyVoiceId);

    try {
        const prompt = `Create an engaging ${genre} story about ${topic} for children aged ${ageGroup}. 

Requirements:
- The story should be educational and engaging
- Keep it approximately ${wordCount} words long
- Use language and concepts appropriate for ${ageGroup} age group
- Include a clear beginning, middle, and end
- Use descriptive language and dialogue where appropriate
- Make the story help students understand ${topic} easily
- Format the story with proper paragraphs and spacing
- Focus on making complex concepts simple and memorable
- Include elements that will capture and maintain children's attention

Please write the story:`;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite",
            config: {
                temperature: 0.7,
                maxOutputTokens: Math.max(wordCount * 4, 1000),
            }
        });

        // Generate the story
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const story = response.text().trim();

        // Generate audio using Murf streaming API
        // const murfResponse = await fetch('https://api.murf.ai/v1/speech/stream', {
            // method: 'POST',
            // headers: {
                // 'Content-Type': 'application/json',
                // 'api-key': process.env.MURF_API_KEY
            // },
            // body: JSON.stringify({
                // text: story,
                // voice_id: storyVoiceId,
                // format: 'MP3'
            // })
        // });

        // if (!murfResponse.ok) {
            // throw new Error('Failed to generate audio stream');
        // }
        // console.log("Murf response:", murfResponse);
        //// Create write stream for audio file
        // const fileName = `story_${Date.now()}.mp3`;
        // const filePath = `./public/audio/${fileName}`;
        // const writer = fs.createWriteStream(filePath);

        //// Pipe the audio stream to file
        // murfResponse.body.pipe(writer);

        // //Handle stream completion
        // await new Promise((resolve, reject) => {
            // writer.on('finish', resolve);
            // writer.on('error', reject);
        // });

        // Increment story count
        try {
            await User.findByIdAndUpdate(
                req.user._id,
                { $inc: { TotalStories: 1 } },
                { new: true }
            );
        } catch (error) {
            console.error('Error updating story count:', error);
        }

        // Send response with story and audio URL
        res.json({
            success: true,
            story: story,
            // audioUrl: `/audio/${fileName}`
        });

    } catch (error) {
        console.error('Story generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate story'
        });
    }
});

// @desc    Save a story
// @route   POST /api/storyteller/save
// @access  Private
const saveStory = asyncHandler(async (req, res) => {
    const { title, content, audioUrl, metadata } = req.body;

    const story = await Story.create({
        user: req.user._id,
        title,
        content,
        audioUrl,
        metadata
    });

    res.status(201).json({
        success: true,
        story
    });
});

// @desc    Get all saved stories for a user
// @route   GET /api/storyteller/saved
// @access  Private
const getSavedStories = asyncHandler(async (req, res) => {
    const stories = await Story.find({ user: req.user._id })
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        stories
    });
});

// @desc    Delete a story
// @route   DELETE /api/storyteller/saved/:id
// @access  Private
const deleteStory = asyncHandler(async (req, res) => {
    const story = await Story.findOne({ _id: req.params.id, user: req.user._id });

    if (!story) {
        return res.status(404).json({
            success: false,
            error: 'Story not found'
        });
    }

    await Story.deleteOne({ _id: req.params.id });

    res.json({
        success: true,
        message: 'Story deleted successfully'
    });
});

// @desc    Generate quiz questions for a story
// @route   POST /api/storyteller/generate-quiz
// @access  Private
const generateQuiz = asyncHandler(async (req, res) => {
    const { topic, ageGroup, wordCount } = req.body;

    try {
        const numQuestions = wordCount <= 150 ? 5 : 8;

        const prompt = `Create a multiple-choice quiz about the following educational topic. The quiz should be appropriate for ${ageGroup} age group.

Topic/Concept:
${topic}

Requirements:
- Generate exactly ${numQuestions} questions
- Each question should have exactly 4 options (A, B, C, D)
- Questions should test comprehension and understanding
- Make questions age-appropriate for ${ageGroup}
- Include a mix of direct recall and inferential questions
- One option must be clearly correct
- Return ONLY the JSON object without any markdown formatting or additional text
- The response must be a valid JSON object in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Correct option here"
    } 
  ]
}

Generate the quiz:`;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite",
            config: {
                temperature: 0.3
            }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();

        // Clean the response text
        let cleanedText = rawText
            // Remove any markdown code block indicators
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        // Try to find the JSON object if there's additional text
        const jsonStart = cleanedText.indexOf('{');
        const jsonEnd = cleanedText.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanedText = cleanedText.slice(jsonStart, jsonEnd);
        }

        try {
            const quizData = JSON.parse(cleanedText);

            if (!quizData.questions || !Array.isArray(quizData.questions)) {
                throw new Error('Invalid quiz format: missing questions array');
            }

            // Validate each question
            quizData.questions.forEach((q, index) => {
                if (!q.question || !q.options || !Array.isArray(q.options) || !q.correctAnswer) {
                    throw new Error(`Invalid question format at index ${index}`);
                }
                if (q.options.length !== 4) {
                    throw new Error(`Question ${index + 1} must have exactly 4 options`);
                }
                if (!q.options.includes(q.correctAnswer)) {
                    throw new Error(`Question ${index + 1} correct answer must be one of the options`);
                }
            });

            res.json({
                success: true,
                quiz: quizData
            });
        } catch (parseError) {
            console.error('JSON parsing error:', parseError, '\nCleaned text:', cleanedText);
            throw new Error('Failed to parse quiz data: ' + parseError.message);
        }

    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate quiz: ' + error.message
        });
    }
});

// @desc    Stream audio for a story
// @route   POST /api/storyteller/stream-audio
// @access  Public
const streamStoryAudio = asyncHandler(async (req, res) => {
    const { text, voiceId } = req.body;
    console.log("Voice id from streamStoryAudio:", voiceId);
    try {
        const response = await fetch('https://api.murf.ai/v1/speech/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.MURF_API_KEY
            },
            body: JSON.stringify({
                text: text,
                voice_id: voiceId,
                format: 'MP3'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Murf API error response:', errorText);
            throw new Error('Failed to generate audio stream');
        }
        console.log("Murf response for streaming audio");

        // Set appropriate headers for audio streaming
        res.setHeader('Content-Type', 'audio/mp3');
        res.setHeader('Transfer-Encoding', 'chunked');

        console.log("Piping audio for in the backend /stream endpoint");
        // Pipe the audio stream directly to response
        response.body.pipe(res);

    } catch (error) {
        console.error('Audio streaming error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate audio' });
    }
});

// @desc    Delete audio file
// @route   DELETE /api/storyteller/delete-audio/:filename
// @access  Public
const deleteAudio = asyncHandler(async (req, res) => {
    const { filename } = req.params;
    const filePath = `./public/audio/${filename}`;
    console.log("filePath in deleteAudio:",filePath);

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true, message: 'Audio file deleted successfully' });
        } else {
            res.json({ success: true, message: 'File does not exist' });
        }
    } catch (error) {
        console.error('Error deleting audio file:', error);
        res.status(500).json({ success: false, error: 'Failed to delete audio file' });
    }
});

export default {
    generateStory,
    generateStoryFromConcept,
    saveStory,
    getSavedStories,
    deleteStory,
    generateQuiz,
    streamStoryAudio,
    deleteAudio
}; 