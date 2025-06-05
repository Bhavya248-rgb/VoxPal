import express from 'express';
import multer from 'multer';
import { validateToken } from '../middlewares/validateTokenHandler.js';
import {
  convertSpeechToTextController,
  generateFeedbackController,
  saveSessionController,
  getSessionsController,
  deleteSessionController
} from '../controllers/voiceCoachController.js';
// import {streamStoryAudio} from '../controllers/storyController.js';

const router = express.Router();

// Configure multer for handling audio files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Convert speech to text
router.post('/convert', validateToken, upload.single('audio'), convertSpeechToTextController);

// Stream story audio
// router.post('/stream-audio', validateToken, streamStoryAudio);

// Generate feedback without saving
router.post('/generate-feedback', validateToken, generateFeedbackController);

// Save session if user chooses to save
router.post('/save-session', validateToken, saveSessionController);

// Get user's voice sessions
router.get('/sessions', validateToken, getSessionsController);

// Delete a voice session
router.delete('/sessions/:id', validateToken, deleteSessionController);

export default router;