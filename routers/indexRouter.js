import express, { Router } from "express";
const router = express.Router()
import entryRouter from "./entryRouter.js";
import authRouter from "./authRouter.js"

router.use("/", entryRouter)
router.use("/", authRouter)


export default router