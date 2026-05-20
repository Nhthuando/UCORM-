import express from "express";
import {generateAIReply,getAIReply} from "../controllers/AIEngineController.js"
import {authMiddleware} from "../middlewares/authMiddleware.js"

const router = express.Router();

router.post("/:reviewId/generate", authMiddleware, generateAIReply );
router.post("/:reviewId/reply", getAIReply);

export default router;