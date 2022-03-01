import mongoose from "mongoose"
import User from "../models/userModel.js"
import Token from "../models/tokenModel.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


const signUp = async (req, res) => {
    try {
        const { email, password, confirmPassword, userName } = req.body

        const emailExist = await User.findOne({ email })
        if (emailExist) return res.status(400).json({ message: "This email has already been taken" })

        const userNameExist = await User.findOne({ userName })
        if (userNameExist) return res.status(400).json({ message: "This user name has already been taken" })

        if (password !== confirmPassword) return res.status(400).json({ message: "Password can't be confirmed" })

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            email,
            userName,
            password: hashedPassword,
        })

        const accessToken = jwt.sign(
            {
                email: user.email,
                id: user._id,
            },
            process.env.ACCESS_TOKEN_SECRETKEY,
            {
                expiresIn: '3m'
            }
        )

        const refreshToken = jwt.sign(
            {
                email: user.email,
                id: user._id,
            },
            process.env.REFRESH_TOKEN_SECRETKEY,
        )

        await Token.create({
            userId: user._id,
            refreshToken: refreshToken
        })

        res.cookie('token', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true

        })

        res.status(200).json({ user, accessToken })
    } catch (error) {
        console.log(error)
    }
}

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(404).json({ message: "User not found" })

        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) return res.status(404).json({ message: "Check your password" })

        const accessToken = jwt.sign(
            {
                email: user.email,
                id: user._id,
            },
            process.env.ACCESS_TOKEN_SECRETKEY,
            { expiresIn: "3m" }
        )

        const refreshToken = jwt.sign(
            {
                email: user.email,
                id: user._id,
            },
            process.env.REFRESH_TOKEN_SECRETKEY
        )
        await Token.findOneAndUpdate(
            { userId: user._id },
            { refreshToken: refreshToken },
            { new: true }
        )

        res.cookie('token', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true

        })

        res.status(200).json({ user, accessToken })
    } catch (error) {
        res.status(500).json({ message: "Something went wrong :((" })
    }
}


const logOut = async (req, res) => {
    try {
        const { id } = req.params
        res.clearCookie('token')
        await Token.findOneAndUpdate(
            { userId: id },
            { refreshToken: null },
            { new: true }
        )
        res.status(200).json({ message: "LogOut Successfully" })
    } catch (error) {
        res.status(500).json(error)
    }
}


const refreshToken = async (req, res) => {
    try {
        const { id } = req.params
        const { refreshToken } = await Token.findOne({ userId: id })
        if (!refreshToken) return res.status(401)

        const cookie = req.cookie.Token
        if (!cookie) res.status(403)

        if (cookie !== refreshToken) res.status(401)

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRETKEY, (err, decodedRefreshToken) => {
            if (err) return res.status(403).json(err)

            const accessToken = jwt.sign({ email: decodedRefreshToken.email, id: decodedRefreshToken.id },
                process.env.ACCESS_TOKEN_SECRETKEY, { expiresIn: "3m" })
            res.status(200).json(accessToken)
        })

    } catch (error) {
        console.log(error.message)
    }
}


export default { signUp, logOut, signIn, refreshToken }