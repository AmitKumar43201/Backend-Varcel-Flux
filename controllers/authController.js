import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import UserModel from '../models/user.js'


const signup = async (req,res) => {
    try {
        const {name, email, password} = req.body
        const user = await UserModel.findOne({email})
        if (user) {
            return res.status(409).json({message: "user already exists, please signin", success: false})
        }
        const userModel = new UserModel({name,email,password})
        userModel.password = await bcrypt.hash(password, 10)
        await userModel.save()
        const jwToken = jwt.sign({
            email: userModel.email, _id:userModel._id 
        },
        process.env.JWT_KEY,
        {expiresIn:"1h"}
        )
        res.cookie('token', jwToken, {
            httpOnly: true,       // Prevents client-side JS from reading the cookie
            secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
            sameSite: 'lax',   // Helps mitigate CSRF
            maxAge: 60 * 60 * 1000 // 1 hour in milliseconds
        });
        res.status(200)
           .json({
            message: "Signup successfull",
            success: true,
            email: userModel.email,
            name: userModel.name
            })
    } catch (err) {
        return res.status(500).json({message: "Internal server error",success:false, err})
    }
}


const login = async (req,res) => {
    try {
        const {email,password} = req.body
        const user = await UserModel.findOne({email})
        if (!user) {
            return res.status(403).json({message: "User doesn't exists, please sign-in"})
        }
        const isPassEqual = await bcrypt.compare(password, user.password)
        if (!isPassEqual) {
            return res.status(403).json({message: "Wrong password, please enter correct password"})
        }
        const jwToken = jwt.sign({
            email: user.email, _id:user._id 
        },
        process.env.JWT_KEY,
        {expiresIn:"1h"}
        )
        res.cookie('token', jwToken, {
            httpOnly: true,       // Prevents client-side JS from reading the cookie
            secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
            sameSite: 'lax',   // Helps mitigate CSRF
            maxAge: 60 * 60 * 1000 // 1 hour in milliseconds
        });
        res.status(200)
           .json({
            message: "Login successfull",
            success: true,
            email: user.email,
            name: user.name,
            project: user.project
            })

    } catch (err) {
        res.status(500).json({message:"internal server error",err})
    }
}

export default {
    signup,
    login
}