import express from "express";
import {
    GetIndex,
    GetCreate,
    PostCreate,
    GetEdit,
    PostEdit,
    PostDelete
} from "../controllers/SeriesController.js";

const router = express.Router();

router.get("/index", GetIndex);

router.get("/create", GetCreate);
router.post("/create", PostCreate);

router.get("/edit/:seriesId", GetEdit);
router.post("/edit", PostEdit);

router.post("/delete", PostDelete);

export default router;