import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishVideo,
  togglePublishStatus,
  updateVideoDetails,
  updateVideoAssets,
  incrementViews,
} from "../controllers/video.controller.js";
import { generateUploadUrl } from "../utils/r2.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/")
  .get(getAllVideos)
  .post(verifyJWT, publishVideo);

router
  .route("/:videoId")
  .get(optionalVerifyJWT, getVideoById)
  .delete(verifyJWT, deleteVideo);

router.route("/:videoId/details").patch(verifyJWT, updateVideoDetails);

router
  .route("/:videoId/assets")
  .patch(verifyJWT, generateUploadUrl, updateVideoAssets);

router.route("/:videoId/toggle-publish").patch(verifyJWT, togglePublishStatus);

router.route("/:videoId/increment-views").patch(incrementViews);

export default router;
