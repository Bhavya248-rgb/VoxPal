import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import Landing from './Pages/Landing';
import Storyteller from './Pages/Storyteller.jsx';
import CreateStory from './components/storyteller/CreateStory.jsx';
import UnderstandConcept from './components/storyteller/UnderstandConcept.jsx'; 
import QuizPage from './components/storyteller/QuizPage.jsx';
import MySaves from './Pages/MySaves';
import VoiceCoach from './Pages/VoiceCoach';
import VoiceAssist from './Pages/VoiceAssist';
import Talkmate from './Pages/Talkmate';
import ChatInterface from './components/ChatInterface';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Settings from './Pages/Settings';
import { VoiceProvider } from './context/VoiceContext';
import Pricing from './Pages/Pricing';
function App() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  return (
    <VoiceProvider>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/storyteller" element={<Storyteller />} />
            <Route path="/storyteller/explain" element={<UnderstandConcept />} />
            <Route path="/storyteller/create" element={<CreateStory />} />
            <Route path="/storyteller/quiz" element={<QuizPage />} />
            <Route path="/voice-coach" element={<VoiceCoach />} />
            <Route path="/voice-assist" element={<VoiceAssist />} />
            <Route path="/my-saves" element={<MySaves />} />
            <Route path="/talkmate" element={<Talkmate />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
        {user && location.pathname !== '/talkmate' && location.pathname !== '/storyteller/quiz' && <ChatInterface mode="widget" />}
        <ToastContainer />
      </div>
    </VoiceProvider>
  );
}

export default App;
