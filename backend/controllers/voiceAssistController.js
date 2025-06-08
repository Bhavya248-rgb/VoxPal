import asyncHandler from 'express-async-handler';
import murfService from '../services/murfServices.js';
import { extractTextFromFile } from '../services/textExtractionService.js';
import fs from 'fs';
import { promisify } from 'util';
import User from '../models/userModel.js';

const unlinkAsync = promisify(fs.unlink);

// @desc    Summarize text and optionally convert to speech
// @route   POST /api/voice-assist/summarize
// @access  Private
export const summarizeText = asyncHandler(async (req, res) => {
    const { text, maxLength = 'medium', convertToSpeech = false, voiceId } = req.body;
    
    if (!text) {
        res.status(400);
        throw new Error('Please provide text to summarize');
    }

    // Check if user is premium for longer text
    if (!req.user.isPremium && text.length > 3000) {
        res.status(403);
        throw new Error('Free users can only summarize up to 3000 characters');
    }

    const summary = await murfService.summarizeText(text, { maxLength });
    let audioUrl = null;
// 
    // if (convertToSpeech == true) {
        // audioUrl = await murfService.textToSpeech(summary, voiceId);
    // }
    
    res.status(200).json({
        success: true,
        summary,
        // audioUrl
    });
});

// @desc    Translate text and optionally convert to speech
// @route   POST /api/voice-assist/translate
// @access  Private
export const translateText = asyncHandler(async (req, res) => {
    const { text, targetLanguage, convertToSpeech = false } = req.body;
    
    if (!text || !targetLanguage) {
        res.status(400);
        throw new Error('Please provide text and target language');
    }

    // Check if user is premium for longer text
    if (!req.user.isPremium && text.length > 200) {
        res.status(403);
        throw new Error('Free users can only translate up to 200 characters');
    }

    const translatedText = await murfService.translateText(text, targetLanguage);
    let audioUrl = null;

    await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { TotalTranslations: 1 } },
        { new: true }
    );

    if (convertToSpeech == true) {
        // Get available voices and filter for target language
        const voices = await murfService.getVoices();
        const matchingVoices = voices.filter(voice => 
            voice.locale.toLowerCase() === targetLanguage.toLowerCase()
        );

        if (matchingVoices.length > 0) {
            const randomVoice = matchingVoices[Math.floor(Math.random() * matchingVoices.length)];
            audioUrl = await murfService.textToSpeech(translatedText, randomVoice.voice_id);
        } else {
            console.warn(`No matching voice found for language ${targetLanguage}`);
            audioUrl = await murfService.textToSpeech(translatedText);
        }
    }
    
    res.status(200).json({
        success: true,
        translatedText,
        audioUrl
    });
});

// @desc    Summarize text from uploaded file
// @route   POST /api/voice-assist/summarize-file
// @access  Private
export const summarizeFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a file');
    }

    try {
        // Check file size for non-premium users
        if (!req.user.isPremium && req.file.size > 1000000) { // 1MB
            await unlinkAsync(req.file.path); // Delete file if size check fails
            res.status(403);
            throw new Error('Free users can only upload files up to 1MB');
        }

        const extractedText = await extractTextFromFile(req.file.path);
        
        // Delete the file after text extraction
        await unlinkAsync(req.file.path);
        
        // Check text length for free users
        if (!req.user.isPremium && extractedText.length > 3000) {
            res.status(403);
            throw new Error('Free users can only summarize content up to 3000 characters');
        }

        // Parse convertToSpeech from form data
        const convertToSpeech = req.body.convertToSpeech === 'true';
        const maxLength = req.body.maxLength || 'medium';
        const voiceId = req.body.voiceId;

        console.log('File summarization options:', {
            convertToSpeech,
            maxLength,
            voiceId
        });

        const summary = await murfService.summarizeText(extractedText, { maxLength });
        let audioUrl = null;

        // if (convertToSpeech) {
            // console.log('Converting summary to speech...');
            // audioUrl = await murfService.textToSpeech(summary, voiceId);
            // console.log('Speech conversion completed, audioUrl:', audioUrl);
        // }
        
        res.status(200).json({
            success: true,
            originalText: extractedText,
            summary,
            // audioUrl
        });
    } catch (error) {
        // If any error occurs and the file still exists, delete it
        if (req.file && req.file.path) {
            try {
                await unlinkAsync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        throw error;
    }
});

// @desc    Get available voices
// @route   GET /api/voice-assist/voices
// @access  Private
export const getVoices = asyncHandler(async (req, res) => {
    const voices = await murfService.getVoices();
    res.status(200).json({
        success: true,
        voices:voices
    });
});


// @desc    Read text from uploaded file
// @route   POST /api/voice-assist/read-file
// @access  Private
export const readFromFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a file');
    }

    // Check file size for non-premium users
    if (!req.user.isPremium && req.file.size > 1000000) { // 1MB
        res.status(403);
        throw new Error('Free users can only upload files up to 1MB');
    }

    const extractedText = await extractTextFromFile(req.file.path);
    const audioUrl = await murfService.textToSpeech(extractedText);
    
    res.status(200).json({
        success: true,
        text: extractedText,
        audioUrl
    });
}); 