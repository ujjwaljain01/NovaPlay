import { Router } from "express";
import {
  addToWatchHistory,
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getUserChannelVideos,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { generateUploadUrl } from "../utils/r2.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";

const router = new Router();

//routes import
router.route("/register").post(generateUploadUrl, registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/avatar").patch(verifyJWT, generateUploadUrl, updateUserAvatar);
router
  .route("/coverImage")
  .patch(verifyJWT, generateUploadUrl, updateUserCoverImage);
router.route("/c/:username").get(optionalVerifyJWT, getUserChannelProfile);
router.route("/c/:username/videos").get(getUserChannelVideos);
router
  .route("/history")
  .get(verifyJWT, getWatchHistory)
  .patch(verifyJWT, addToWatchHistory);
router.route("/get-upload-url").post(generateUploadUrl);

export default router;
