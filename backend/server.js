import express from "express";
import connectDb from "./config/dbConnection.js";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import storyRoutes from "./routes/storyRoutes.js";
import voiceRoutes from "./routes/voiceRoutes.js";
import voiceAssistRoutes from "./routes/voiceAssistRoutes.js";
import voiceChatRoutes from "./routes/voiceChatRoutes.js";
import { EventEmitter } from 'events';

// Increase max listeners
EventEmitter.defaultMaxListeners = 15;

dotenv.config();
connectDb();

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://voxpal.onrender.com']  // Replace with your Render frontend URL
        : ['http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200
};

// app.use(cors()); // Use default CORS settings for development
app.use(cors(corsOptions));

const port = process.env.PORT || 7000;
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to VoXPal");
});

app.use("/api/auth", authRoutes);
app.use("/api/storyteller", storyRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/voice-assist", voiceAssistRoutes);
app.use("/api/voice-chat", voiceChatRoutes);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
