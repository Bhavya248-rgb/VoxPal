import express from 'express';
import { 
    summarizeText,
    summarizeFile,
    getVoices,
    translateText
} from '../controllers/voiceAssistController.js';
import {validateToken} from '../middlewares/validateTokenHandler.js';
import upload from '../middlewares/fileUpload.js';

const router = express.Router();

// Apply token validation to all routes
router.use(validateToken);

// Get available voices (for optional text-to-speech)
router.get('/voices', getVoices);

// Text summarization routes
router.post('/summarize', summarizeText);
router.post('/summarize-file', upload.single('file'), summarizeFile);
router.post('/translate', translateText);

export default router; 