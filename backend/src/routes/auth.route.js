//backend/src/routes/auth.route.js
import { Router } from "express";
import passport from "passport";
import { googleAuthCallback } from "../controllers/user.controller.js";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/v1/auth/login-failed",
    successRedirect: "/dashboard",
  }),
  googleAuthCallback
);

router.get("/login-failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Google authentication failed.",
  });
});

export default router;
