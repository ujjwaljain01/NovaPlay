import { Router } from "express";
import { getExploreFeed } from "../controllers/explore.controller.js";
import { optionalVerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:category").get(optionalVerifyJWT, getExploreFeed);

export default router;
