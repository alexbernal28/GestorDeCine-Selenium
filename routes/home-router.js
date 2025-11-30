import express from "express";
import {
    GetIndex,
    PostFilter
} from "../controllers/HomeController.js";

const router = express.Router();

router.get("/", GetIndex);
router.post("/filter", PostFilter);

export default router;