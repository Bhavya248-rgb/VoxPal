import mongoose from 'mongoose';

const voiceSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  audienceType: {
    type: String,
    required: true
  },
  speechType: {
    type: String,
    required: true
  },
  speechText: {
    type: String,
    required: true
  },
  recordedAudioUrl: {
    type: String
  },
  transcription: {
    type: String
  },
  feedback: {
    analysis: {
      type: String,
      required: true
    },
    questions: [{
      type: String
    }],
    overallFeedback: {
      type: String,
      required: true
    },
    reactions: [{
      type: String
    }],
    scores: {
      clarity: Number,
      engagement: Number,
      structure: Number,
      delivery: Number
    },
    feedbackAudioUrl: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const VoiceSession = mongoose.model('VoiceSession', voiceSessionSchema);

export default VoiceSession;
