import userModel from "../models/user.model.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from "../config/config.js"

export async function register(req, res) {
    const { username, email, password } = req.body

    const isAlreadyRegisteres = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    })
    if (isAlreadyRegisteres) {
        return res.status(409).json({
            message: "Username or email already exists"
        })
    }
    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign({
        id: user._id
    }, config.JWT_SECRET, { expiresIn: "1d" })
    res.cookie('token', token)

    return res.status(201).json({
        message: "User registered successfully",
        user: {
            username,
            email
        },
        token
    })

}

export async function getMe(req,res) {

    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token

    if(!token){
        return res.status(401).json({
            message: "Token not found"
        })
    }

    const decoded = jwt.verify(token, config.JWT_SECRET)

    const user = await userModel.findById(decoded.id)

    return res.status(200).json({
        message: "User fetched successfully",
        user: {
            username: user.username,
            email: user.email
        }
    })
}