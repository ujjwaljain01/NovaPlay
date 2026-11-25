import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.exists({ _id: videoId });
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  try {
    const deletedLike = await Like.findOneAndDelete({
      likedBy: userId,
      targetType: "Video",
      targetId: videoId,
    });

    if (deletedLike) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Video unliked successfully"));
    }

    const newLike = await Like.create({
      likedBy: userId,
      targetType: "Video",
      targetId: videoId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newLike, "Video liked successfully"));
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Action already processed. Please try again.");
    }
    throw error;
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const CommentExists = await Comment.exists({ _id: commentId });
  if (!CommentExists) {
    throw new ApiError(404, "Comment not found");
  }
  try {
    const deletedLike = await Like.findOneAndDelete({
      likedBy: userId,
      targetType: "Comment",
      targetId: commentId,
    });

    if (deletedLike) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment unliked successfully"));
    }

    const newLike = await Like.create({
      likedBy: userId,
      targetType: "Comment",
      targetId: commentId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newLike, "Comment liked successfully"));
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Action already processed. Please try again.");
    }
    throw error;
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.exists({ _id: tweetId });
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  try {
    const deletedLike = await Like.findOneAndDelete({
      likedBy: userId,
      targetType: "Tweet",
      targetId: tweetId,
    });

    if (deletedLike) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Video unliked successfully"));
    }

    const newLike = await Like.create({
      likedBy: userId,
      targetType: "Tweet",
      targetId: tweetId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newLike, "Video liked successfully"));
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Action already processed. Please try again.");
    }
    throw error;
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const likedVideos = await Like.aggregate([
    {
      $match: { likedBy: userId, targetType: "Video" },
    },
    {
      $lookup: {
        from: "videos",
        localField: "targetId",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$video",
    },
    {
      $lookup: {
        from: "users",
        localField: "video.owner",
        foreignField: "_id",
        as: "video.owner",
      },
    },
    {
      $unwind: "$video.owner",
    },
    {
      $project: {
        _id: "$video._id",
        title: "$video.title",
        thumbnail: "$video.thumbnail",
        duration: "$video.duration",
        owner: {
          _id: "$video.owner._id",
          username: "$video.owner.username",
          avatar: "$video.owner.avatar",
        },
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
