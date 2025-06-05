import mongoose from 'mongoose';

const voiceChatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conversationCount: {
        type: Number,
        default: 0
    },
    lastResetDate: {
        type: Date,
        default: Date.now
    },
    conversations: [{
        message: String,
        response: String,
        audioUrl: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Reset conversation count daily for free users
voiceChatSchema.methods.resetIfNeeded = async function() {
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const now = new Date();
    
    if (now - this.lastResetDate > oneDayInMs) {
        this.conversationCount = 0;
        this.lastResetDate = now;
        await this.save();
    }
};

// Check if user has reached daily limit
voiceChatSchema.methods.hasReachedDailyLimit = function() {
    return this.conversationCount >= 5;
};

const VoiceChat = mongoose.model('VoiceChat', voiceChatSchema);

export default VoiceChat; 