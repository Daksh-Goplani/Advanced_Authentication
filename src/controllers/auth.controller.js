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

    const accessToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET, { expiresIn: "15m" })

    const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET, { expiresIn: "7d" })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    return res.status(201).json({
        message: "User registered successfully",
        user: {
            username,
            email
        },
        accessToken
    })

}

export async function getMe(req, res) {

    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            message: "Token not found"
        })
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET)

        const user = await userModel.findById(decoded.id)

        return res.status(200).json({
            user
        })
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        })
    }

    return res.status(200).json({
        message: "User fetched successfully",
        user: {
            username: user.username,
            email: user.email
        }
    })
}

export async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

    const accessToken = jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET, { expiresIn: "15m" })

    const newRefreshToken = jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET, { expiresIn: "7d" })

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    return res.status(200).json({
        message: "Access token refreshed successfully",
        accessToken
    })
}