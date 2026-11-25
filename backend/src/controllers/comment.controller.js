import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.isValidObjectId(id);

const EDIT_TOLERANCE_MS = 1000;
const computeIsEdited = (createdAt, updatedAt) => {
  if (!createdAt || !updatedAt) return false;
  return (
    new Date(updatedAt).getTime() - new Date(createdAt).getTime() >
    EDIT_TOLERANCE_MS
  );
};

const getComments = asyncHandler(async (req, res) => {
  const { targetId } = req.params;
  const { limit = 10, cursor } = req.query;

  if (!isValidObjectId(targetId)) {
    throw new ApiError(400, "Invalid target ID");
  }

  const [videoExists, tweetExists] = await Promise.all([
    Video.exists({ _id: targetId }),
    Tweet.exists({ _id: targetId }),
  ]);

  if (!videoExists && !tweetExists) {
    throw new ApiError(404, "Video or Tweet not found");
  }

  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

  const matchStage = {
    targetId: new mongoose.Types.ObjectId(targetId),
    parentCommentId: null,
  };

  if (cursor) {
    const cursorDate = new Date(cursor);
    if (Number.isNaN(cursorDate.getTime())) {
      throw new ApiError(400, "Invalid cursor");
    }
    matchStage.createdAt = {
      $lt: cursorDate,
    };
  }

  const currentUserId = req.user?._id
    ? new mongoose.Types.ObjectId(req.user._id)
    : null;

  const aggregationPipeline = [
    {
      $match: matchStage,
    },
    { $sort: { createdAt: -1 } },
    { $limit: parsedLimit + 1 },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "parentCommentId",
        as: "replies",
      },
    },
    {
      $lookup: {
        from: "likes",
        let: { commentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$targetId", "$$commentId"] },
                  { $eq: ["$targetType", "Comment"] },
                ],
              },
            },
          },
        ],
        as: "likes",
      },
    },
    {
      $project: {
        _id: 1,
        content: 1,
        targetType: 1,
        createdAt: 1,
        updatedAt: 1,
        isEdited: {
          $gt: [{ $subtract: ["$updatedAt", "$createdAt"] }, EDIT_TOLERANCE_MS],
        },
        replyCount: { $size: "$replies" },
        repliesCount: { $size: "$replies" },
        likeCount: { $size: "$likes" },
        isLiked: currentUserId
          ? { $in: [currentUserId, "$likes.likedBy"] }
          : false,
        owner: {
          _id: "$owner._id",
          username: "$owner.username",
          fullName: "$owner.fullName",
          avatar: "$owner.avatar",
        },
      },
    },
  ];

  const comments = await Comment.aggregate(aggregationPipeline);

  const hasNextPage = comments.length > parsedLimit;

  if (hasNextPage) {
    comments.pop();
  }

  const nextCursor =
    hasNextPage && comments.length > 0
      ? comments[comments.length - 1].createdAt
      : null;

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comments, nextCursor, hasNextPage },
        "Comments fetched successfully"
      )
    );
});

const getReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { limit = 10, cursor } = req.query;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const parentCommentExists = await Comment.exists({ _id: commentId });
  if (!parentCommentExists) {
    throw new ApiError(404, "Parent comment not found");
  }

  const matchStage = {
    parentCommentId: new mongoose.Types.ObjectId(commentId),
  };

  if (cursor) {
    const cursorDate = new Date(cursor);
    if (Number.isNaN(cursorDate.getTime())) {
      throw new ApiError(400, "Invalid cursor");
    }
    matchStage.createdAt = { $gt: cursorDate };
  }

  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

  const currentUserId = req.user?._id
    ? new mongoose.Types.ObjectId(req.user._id)
    : null;

  const aggregationPipeline = [
    { $match: matchStage },
    { $sort: { createdAt: 1 } },
    { $limit: parsedLimit + 1 },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $lookup: {
        from: "likes",
        let: { commentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$targetId", "$$commentId"] },
                  { $eq: ["$targetType", "Comment"] },
                ],
              },
            },
          },
        ],
        as: "likes",
      },
    },
    {
      $project: {
        _id: 1,
        content: 1,
        targetType: 1,
        parentCommentId: 1,
        createdAt: 1,
        updatedAt: 1,
        isEdited: {
          $gt: [{ $subtract: ["$updatedAt", "$createdAt"] }, EDIT_TOLERANCE_MS],
        },
        likeCount: { $size: "$likes" },
        isLiked: currentUserId
          ? { $in: [currentUserId, "$likes.likedBy"] }
          : false,
        owner: {
          _id: "$owner._id",
          username: "$owner.username",
          fullName: "$owner.fullName",
          avatar: "$owner.avatar",
        },
      },
    },
  ];

  const results = await Comment.aggregate(aggregationPipeline);

  const hasNextPage = results.length > parsedLimit;

  if (hasNextPage) {
    results.pop();
  }

  const nextCursor =
    hasNextPage && results.length > 0
      ? results[results.length - 1].createdAt
      : null;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        replies: results,
        nextCursor,
        hasNextPage,
      },
      "Replies fetched successfully"
    )
  );
});


const addComment = asyncHandler(async (req, res) => {
  const { targetId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  if (!content || content.trim().length === 0) {
    throw new ApiError(400, "Comment content is required");
  }

  const trimmedContent = content.trim();

  if ([...trimmedContent].length > 320) {
    throw new ApiError(400, "Comment content cannot exceed 320 characters");
  }

  if (!targetId || !isValidObjectId(targetId)) {
    throw new ApiError(400, "A valid Target ID is required");
  }

  const [videoExists, tweetExists, parentComment] = await Promise.all([
    Video.exists({ _id: targetId }),
    Tweet.exists({ _id: targetId }),
    Comment.findById(targetId).select("_id parentCommentId"), 
  ]);

  if (!videoExists && !tweetExists && !parentComment) {
    throw new ApiError(404, "Target video, tweet, or comment not found");
  }

  let targetType;
  let parentCommentId = null;

  if (videoExists) {
    targetType = "Video";
  } else if (tweetExists) {
    targetType = "Tweet";
  } else if (parentComment) {
    targetType = "Comment";
    
    // Prevent infinite nesting: If the parent itself is a reply, 
    // lock this reply to the topmost comment thread.
    parentCommentId = parentComment.parentCommentId || parentComment._id;
  }

  const comment = await Comment.create({
    content: trimmedContent,
    targetId,
    targetType,
    owner: userId,
    parentCommentId, 
  });

  await comment.populate({
    path: "owner",
    select: "username fullName avatar",
  });

  const successMessage = parentComment ? "Reply added successfully" : "Comment added successfully";

  const responseComment = {
    ...comment.toObject(),
    likeCount: 0,
    replyCount: 0,
    repliesCount: 0,
    isLiked: false,
    isEdited: false,
  };

  return res
    .status(201)
    .json(new ApiResponse(201, responseComment, successMessage));
});


const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  if (
    !content ||
    typeof content !== "string" ||
    content.trim().length === 0
  ) {
    throw new ApiError(400, "Comment content is required");
  }

  const trimmedContent = content.trim();

  if ([...trimmedContent].length > 320) {
    throw new ApiError(400, "Comment content cannot exceed 320 characters");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "You can only update your own comments");
  }

  if (comment.content !== trimmedContent) {
    comment.content = trimmedContent;
    await comment.save();
  }

  await comment.populate({
    path: "owner",
    select: "username fullName avatar",
  });

  const responseComment = {
    ...comment.toObject(),
    isEdited: computeIsEdited(comment.createdAt, comment.updatedAt),
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, responseComment, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: userId,
  });

  if (!comment) {
    const commentExists = await Comment.exists({ _id: commentId });

    if (!commentExists) {
      throw new ApiError(404, "Comment not found");
    }

    throw new ApiError(403, "You can only delete your own comments");
  }

  if (!comment.parentCommentId) {
    await Comment.deleteMany({ parentCommentId: comment._id });
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});




export { addComment, deleteComment, getComments, updateComment, getReplies };
