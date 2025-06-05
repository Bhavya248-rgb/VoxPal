import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const MURF_API_BASE_URL = 'https://api.murf.ai/v1';

class MurfService {
    constructor() {
        // Check for required API keys
        if (!process.env.MURF_API_KEY) {
            throw new Error('MURF_API_KEY is not configured in environment variables');
        }
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured in environment variables');
        }

        this.murfApiKey = process.env.MURF_API_KEY;
        this.geminiApiKey = process.env.GEMINI_API_KEY;

        try {
            this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
        } catch (error) {
            // console.error('Failed to initialize Gemini AI:', error);
            throw new Error('Failed to initialize Gemini AI service');
        }
        
        this.murfClient = axios.create({
            baseURL: MURF_API_BASE_URL,
            headers: {
                'api-key': this.murfApiKey,
                'Content-Type': 'application/json'
            }
        });
    }

    // Text to Speech streaming
    async textToSpeechStream(text, voiceId = 'en-US-natalie', options = {}) {
        try {
            const response = await this.murfClient.post('/speech/stream', {
                text,
                voice_id: voiceId,
                format: options.format || 'MP3',
                stream: true
            }, {
                responseType: 'stream'
            });
            
            return response.data;
        } catch (error) {
            console.error('Murf TTS streaming error:', error.response?.data || error.message);
            throw new Error('Failed to stream text to speech');
        }
    }

    // Regular Text to Speech conversion
    async textToSpeech(text, voiceId = 'en-US-natalie', options = {}) {
        try {
            const response = await this.murfClient.post('/speech/generate', {
                text,
                voice_id: voiceId,
                format: options.format || 'MP3',
                encode_as_base_64: false
            });
            return response.data.audioFile;
        } catch (error) {
            console.error('Murf TTS error:', error.response?.data || error.message);
            throw new Error('Failed to convert text to speech');
        }
    }

    // Summarize text using Gemini
    async summarizeText(text, options = { maxLength: 'medium' }) {
        if (!this.genAI) {
            throw new Error('Gemini AI service not initialized');
        }

        const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        try {
            let prompt;
            switch(options.maxLength) {
                case 'short':
                    prompt = `Please provide a brief summary (2-3 sentences) of the following text. Focus on the key points and main ideas:\n\n${text}`;
                    break;
                case 'medium':
                    prompt = `Please provide a concise summary (4-5 sentences) of the following text. Include main points and important details:\n\n${text}`;
                    break;
                case 'long':
                    prompt = `Please provide a detailed summary (6-8 sentences) of the following text. Cover all major points and significant details:\n\n${text}`;
                    break;
                default:
                    prompt = `Please provide a concise summary (4-5 sentences) of the following text. Include main points and important details:\n\n${text}`;
            }

            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error('Summarization error:', error);
            if (error.message.includes('API key not valid')) {
                throw new Error('Invalid Gemini API key. Please check your configuration.');
            }
            throw new Error('Failed to summarize text: ' + error.message);
        }
    }

    // Translation
    async translateText(text, targetLanguage) {
        try {
            const response = await this.murfClient.post('/text/translate', {
                texts: [text],
                target_language: targetLanguage
            });
            return response.data.translations[0].translated_text;
        } catch (error) {
            console.error('Murf translation error:', error.response?.data || error.message);
            throw new Error('Failed to translate text');
        }
    }

    // Get available voices
    async getVoices() {
        try {
            const response = await this.murfClient.get('/speech/voices');
            return response.data;
        } catch (error) {
            console.error('Murf voices error:', error.response?.data || error.message);
            throw new Error('Failed to fetch available voices');
        }
    }
}

export default new MurfService(); 