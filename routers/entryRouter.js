import express from "express";
const router = express.Router()
import entryController from "../controllers/entryController.js"
import authMiddleWare from "../middleware/authMiddleWare.js"

router.get("/entry", entryController.getEntries)
router.get("/entry/:id", entryController.getEntryById)
router.post("/entry", authMiddleWare, entryController.postEntry)
router.put("/entry/:id", authMiddleWare, entryController.putEntry)
router.delete("/entry/:id", authMiddleWare, entryController.deleteEntry)
router.post("/entry/:id", authMiddleWare, entryController.createComment)

export default router
