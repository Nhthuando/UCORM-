import express from "express";
import {getPlace,getReview,postPlace} from "../controllers/placeController.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";
import { get } from "node:http";
import { de } from "zod/v4/locales";

const router = express.Router();

router.post("/addPlaces", authMiddleware,postPlace);
router.get("/", authMiddleware,getPlace);
router.get("/:placeId/fetch-reviews", authMiddleware,getReview);

export default router;