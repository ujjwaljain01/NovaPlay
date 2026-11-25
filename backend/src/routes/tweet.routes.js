import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getAllTweets,
  getUserTweets,
  updateTweet,
  getTweetById,
} from "../controllers/tweet.controller.js";
import { optionalVerifyJWT, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/")
  .get(optionalVerifyJWT, getAllTweets)
  .post(verifyJWT, createTweet);
router.route("/user/:userId").get(optionalVerifyJWT, getUserTweets);
router
  .route("/:tweetId")
  .get(optionalVerifyJWT, getTweetById)
  .patch(verifyJWT, updateTweet)
  .delete(verifyJWT, deleteTweet);

export default router;
