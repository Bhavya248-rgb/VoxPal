import express from 'express';
import userController from '../controllers/userController.js';
import { validateToken } from '../middlewares/validateTokenHandler.js';

const router = express.Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/current", validateToken, userController.currentUser);

export default router; 