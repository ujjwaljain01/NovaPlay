import { Router } from "express";
import { globalSearch } from "../controllers/search.controller.js";

const router = Router();

// Dedicated global endpoint path
router.route("/").get(globalSearch);

export default router;
