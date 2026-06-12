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

    return res.status(201).json({
        message: "User registered successfully",
        user: {
            username,
            email
        },
        token
    })

}
