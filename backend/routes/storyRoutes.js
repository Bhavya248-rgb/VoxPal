import express from 'express';
import { validateToken } from '../middlewares/validateTokenHandler.js';
import storyController from '../controllers/storyController.js';
const router = express.Router();

// Story generation routes
router.post('/generate-story', validateToken, storyController.generateStory);
router.post('/concept-to-story', validateToken, storyController.generateStoryFromConcept);
router.post('/stream-audio', validateToken, storyController.streamStoryAudio);
router.delete('/delete-audio/:filename', storyController.deleteAudio);

// Story management routes
router.post('/save', validateToken, storyController.saveStory);
router.get('/saved', validateToken, storyController.getSavedStories);
router.delete('/saved/:id', validateToken, storyController.deleteStory);

// Quiz routes
router.post('/generate-quiz', validateToken, storyController.generateQuiz);

export default router;