# 🎙️ VoxPal – Your Voice-Powered Virtual Friend

Welcome to **VoxPal**, your voice companion — not just a chatbot, but a talking pal who helps you **learn, speak, express, and grow** through natural conversations and engaging voice features.

> “Vox” means *Voice* in Latin, and “Pal” means *Friend/Partner*.

---

## 🎯 What is VoxPal?

**VoxPal** is a voice-powered platform designed for **students**, **learners**, and **curious minds**. Whether you want to understand tough concepts, improve your public speaking, summarize texts, or just have a friendly conversation — **VoxPal is here to support**.

Choose your favorite voice in the settings, and let your Pal assist you through your personal journey of **learning and expression**.

---

## 👥 Who Is VoxPal For?

### 🎓 Students  
Master tough subjects with **story-based explanations**, improve **public speaking skills** with real-time coaching, and **summarize notes**, research papers, textbooks, or articles with ease. VoxPal turns studying into an interactive, voice-powered journey.

### 🤖 Anyone Curious or Expressive  
Want to **talk, ask questions**, or **turn silly ideas into creative stories**? Too lazy to read long content? VoxPal will **summarize it with voice**. Need to **translate between languages**? Your **TalkMate** is always here — no judgment, just natural conversation.

---

## 🧠 What Can VoxPal Do?

### 1. 📚 **StoryTeller**  
Got a doubt in any topic or bored of reading lessons? Your Pal becomes a **storyteller**, turning complex concepts or random ideas into **engaging, memorable stories** with custom characters and voices.

### 2. 🎤 **VoxCoach**  
Fear of public speaking? VoxPal becomes your **voice coach**. Practice speeches, get **feedback**, and prepare for audience-specific Q&A sessions. Build your **confidence** with your AI mentor.

### 3. 🌉 **VoxBridge**  
Bridging **languages and understanding**: VoxPal helps you **summarize long texts** like research papers or articles and **translate between languages** — all with **clear voice output**.

### 4. 💬 **TalkMate**  
Need someone to talk to or ask questions? VoxPal is your **TalkMate** — **chat naturally**, ask questions, and hear thoughtful responses. Your AI friend is always ready to listen.

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **AI**: Google Gemini API
- **TTS**: Murf.ai API
- **STT**: Assemblyai API
- **Database**: MongoDB

---

## 🚀 Installation & Setup

### 🔧 Backend Setup

1. Navigate to the backend folder:

    ```bash
    cd backend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file and add the following environment variables:

    ```env
    PORT=7000
    CONNECTION_STRING=your_mongodb_uri
    ACCESS_TOKEN_SECRET = your_jwt_access_token
    GEMINI_API_KEY=your_google_generative_ai_key
    MURF_API_KEY=your_murf_ai_key
    ASSEMBLY_API_KEY = your_assembly_api_key
    ```

4. Start the backend server:

    ```bash
    npm run dev
    ```

---

### 🎨 Frontend Setup

1. Navigate to the frontend folder:

    ```bash
    cd frontend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the frontend development server:

    ```bash
    npm run dev
    ```
## 📁 Folder Structure
```
/frontend # React client  
/backend # Express server
/backend/temp #(ignored in Git)
/backend/uploads # Temporary files (ignored in Git)  
/backend/public/audio # Generated audio files (ignored)
```

