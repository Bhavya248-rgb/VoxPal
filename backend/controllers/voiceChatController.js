import asyncHandler from 'express-async-handler';
import { GoogleGenerativeAI } from '@google/generative-ai';
import VoiceChat from '../models/voiceChatModel.js';
import murfService from '../services/murfServices.js';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Stream chat response with voice at end
// @route   POST /api/voice-chat/stream
// @access  Private
export const streamResponse = asyncHandler(async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        res.status(400);
        throw new Error('Please provide a message');
    }

    // Get or create voice chat record for user
    let voiceChat = await VoiceChat.findOne({ user: req.user._id });
    if (!voiceChat) {
        voiceChat = new VoiceChat({ user: req.user._id });
    }

    // Reset conversation count if needed (daily)
    await voiceChat.resetIfNeeded();

    // Check if free user has reached limit
    const hasVoiceAccess = req.user.isPremium || !voiceChat.hasReachedDailyLimit();

    try {
        // Set up SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let fullResponse = '';
        
        // Initialize streaming for text generation
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-lite",
            generationConfig: {
                temperature: 0.7,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            },
        });

        // Stream text response
        const result = await model.generateContentStream(message);
        
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            
            // Send text chunk to client
            res.write(`data: ${JSON.stringify({ type: 'text', content: chunkText })}\n\n`);
        }

        // Generate audio only if user has voice access
        let audioUrl = null;
        if (hasVoiceAccess) {
            try {
                // console.log('Generating audio for text:', fullResponse.slice(0, 100) + '...');
                // const audioData = await murfService.textToSpeech(fullResponse);
                // audioUrl = audioData.audioFile;
                audioUrl = await murfService.textToSpeech(fullResponse);
                console.log('Audio URL generated:', audioUrl);
            } catch (error) {
                console.error('Error generating audio:', error);
            }
        }

        // Increment conversation count for free users
        if (!req.user.isPremium) {
            voiceChat.conversationCount += 1;
        }

        // Save conversation
        voiceChat.conversations.push({
            message,
            response: fullResponse,
            timestamp: new Date()
        });
        await voiceChat.save();

        // Send complete response with audio URL if available
        res.write(`data: ${JSON.stringify({ 
            type: 'complete', 
            content: {
                fullText: fullResponse,
                audioUrl: audioUrl,
                conversationsRemaining: req.user.isPremium ? null : 5 - voiceChat.conversationCount
            }
        })}\n\n`);

        res.end();

    } catch (error) {
        console.error('Error in voice chat stream:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`);
        res.end();
    }
});

// @desc    Get remaining conversations count
// @route   GET /api/voice-chat/history
// @access  Private
export const getHistory = asyncHandler(async (req, res) => {
    const voiceChat = await VoiceChat.findOne({ user: req.user._id });
    
    if (!voiceChat) {
        return res.json({
            success: true,
            conversationsRemaining: req.user.isPremium ? null : 5
        });
    }

    await voiceChat.resetIfNeeded();

    res.json({
        success: true,
        conversationsRemaining: req.user.isPremium ? null : 5 - voiceChat.conversationCount
    });
}); 