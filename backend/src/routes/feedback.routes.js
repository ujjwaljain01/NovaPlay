import { Router } from "express";
import { optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { submitFeedback } from "../controllers/feedback.controller.js";

const router = Router();

router.route("/").post(optionalVerifyJWT, submitFeedback);

export default router;
