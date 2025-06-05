import asyncHandler from "express-async-handler";
import User from "../models/userModel.js"; // Ensure correct export in userModel.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

//@desc Register User
//@route POST /api/auth/register
//@access public
const registerUser = asyncHandler(async(req,res)=>{
    const {username,email,password} = req.body;

    // Check if all fields are provided
    if(!username||!email||!password){
        res.status(400);
        throw new Error("Please fill in all fields");
    }

    // Check if user already exists
    const userAvailable = await User.findOne({email});
    if(userAvailable){
        res.status(400);
        throw new Error("User already exists");
    }
    
    const hashedPassword = await bcrypt.hash(password,10);

    // Create the new user
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    if(user){
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            message: "Registration successful"
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});


//@desc Login User
//@route POST /api/auth/login
//@access public
const loginUser = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        res.status(400);
        throw new Error("Please fill in all fields");
    }
    const user = await User.findOne({email});

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if(user && (await bcrypt.compare(password,user.password))){
        const accessToken = jwt.sign(
            {
                user:{
                    username: user.username,
                    email: user.email,
                    _id: user._id,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "1d",
            }
        );
        res.status(200).json({accessToken, user});
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});


//@desc current User info
//@route GET /api/auth/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
    const fullUser = await User.findById(req.user._id).select('-password'); // exclude password
    if (!fullUser) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json(fullUser);
});

// const currentUser = asyncHandler(async(req,res)=>{
//     console.log("requested current user:",req.user);
//     res.json(req.user);
// });

export default {registerUser, loginUser, currentUser};