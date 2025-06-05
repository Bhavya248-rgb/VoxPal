// const mongoose = require("mongoose");
import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Enter Username:"],
        },
        email: {
            type: String,
            required: [true, "Enter email:"],
            unique: true, // Ensures no duplicate email addresses
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Enter a valid email address",
            ], // Regex to validate email format
        },
        password: {
            type: String,
            required: [true, "Enter a Strong Password:"],
        },
        resetPasswordToken: {
            type: String, // Token for password reset functionality (if needed later)
        },
        resetPasswordExpires: {
            type: Date, // Expiry date for the reset password token
        },
        isPremium: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        TotalTranslations:{
            type: Number,
            default: 0,
        },
        TotalSpeeches:{
            type: Number,
            default: 0,
        },
        TotalStories:{
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true, // Automatically creates 'createdAt' and 'updatedAt' fields
    }
);

const User = mongoose.model("User", userSchema);
export default User;
