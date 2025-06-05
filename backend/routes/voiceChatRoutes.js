import express from 'express';
import { streamResponse, getHistory } from '../controllers/voiceChatController.js';
import { validateToken } from '../middlewares/validateTokenHandler.js';

const router = express.Router();

// Apply token validation to all routes
router.use(validateToken);

// Voice chat routes
router.post('/stream', streamResponse);
router.get('/history', getHistory);

export default router; 