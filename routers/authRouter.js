import express from "express";
const router = express.Router()
import authController from "../controllers/authController.js"

router.post("/signup", authController.signUp)
router.get("/logout/:id", authController.logOut)
router.post("/signin", authController.signIn)
router.get("/refresh/:id", authController.refreshToken)

export default router