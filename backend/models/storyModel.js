import mongoose from "mongoose";

const storySchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        audioUrl: {
            type: String
        },
        metadata: {
            ageGroup: String,
            genre: String,
            wordCount: Number,
            topic: String,
            source: {
                type: String,
                required: true
            }
        }
    },
    {
        timestamps: true
    }
);

const Story = mongoose.model("Story", storySchema);
export default Story; 