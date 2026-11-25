import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import { TweetViewLog } from "../models/tweetViewLog.model.js";
import { extractHashtags } from "../utils/hashtags.js";
import mongoose from "mongoose";

const ensureValidTweet = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid tweet id");
  }
};

const getOptionalCurrentUserId = (req) =>
  req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

const buildTweetEnrichmentStages = (currentUserId) => [
  {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "ownerDetails",
      pipeline: [
        {
          $project: {
            avatar: 1,
            username: 1,
            fullName: 1,
            _id: 1,
          },
        },
      ],
    },
  },
  {
    $lookup: {
      from: "likes",
      let: { tweetId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$targetId", "$$tweetId"] },
                { $eq: ["$targetType", "Tweet"] },
              ],
            },
          },
        },
      ],
      as: "likes",
    },
  },
  {
    $lookup: {
      from: "comments",
      let: { tweetId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$targetId", "$$tweetId"] },
                { $eq: ["$targetType", "Tweet"] },
                { $eq: ["$parentCommentId", null] },
              ],
            },
          },
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
          $project: {
            total: { $add: [1, { $size: "$replies" }] },
          },
        },
      ],
      as: "commentThreads",
    },
  },
  {
    $addFields: {
      owner: { $first: "$ownerDetails" },
      views: { $ifNull: ["$views", 0] },
      likesCount: { $size: "$likes" },
      commentsCount: { $sum: "$commentThreads.total" },
      isLiked: currentUserId
        ? { $in: [currentUserId, "$likes.likedBy"] }
        : false,
    },
  },
  {
    $project: {
      ownerDetails: 0,
      likes: 0,
      commentThreads: 0,
    },
  },
];

const getAllTweets = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Number.parseInt(req.query.limit, 10) || 8);
  const { nextCursor } = req.query;

  const matchFilter = {};
  if (nextCursor) {
    if (!mongoose.isValidObjectId(nextCursor)) {
      throw new ApiError(400, "Invalid cursor");
    }
    matchFilter._id = { $lt: new mongoose.Types.ObjectId(nextCursor) };
  }

  const currentUserId = getOptionalCurrentUserId(req);

  const tweets = await Tweet.aggregate([
    { $match: matchFilter },
    { $sort: { _id: -1 } },
    { $limit: limit + 1 },
    ...buildTweetEnrichmentStages(currentUserId),
  ]);

  // Process infinite scroll evaluation
  const hasNextPage = tweets.length > limit;
  if (hasNextPage) {
    tweets.pop();
  }

  const lastTweet = tweets[tweets.length - 1];
  const endCursor = lastTweet ? lastTweet._id : null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        docs: tweets,
        nextCursor: hasNextPage ? endCursor : null,
        hasNextPage,
      },
      "Tweets fetched successfully for infinite scroll"
    )
  );
});

// router.route("/").post(createTweet);
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body || {};

  if (!req.user?._id) {
    throw new ApiError(401, "Authentication required to create a tweet");
  }

  if (!content || typeof content !== "string" || content.trim() === "") {
    throw new ApiError(400, "Tweet content is required");
  }

  const trimmedContent = content.trim();

  if ([...trimmedContent].length > 320) {
    throw new ApiError(400, "Tweet content cannot exceed 320 characters");
  }
  const tweet = await Tweet.create({
    content: trimmedContent,
    owner: req.user?._id,
  });

  if (!tweet) {
    throw new ApiError(500, "Failed to create tweet due to a DB server error");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

// router.route("/:tweetId").patch(updateTweet)
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!req.user?._id) {
    throw new ApiError(401, "Authentication required to update a tweet");
  }

  ensureValidTweet(tweetId);

  const { content } = req.body || {};

  if (!content || typeof content !== "string" || content.trim() === "") {
    throw new ApiError(400, "Tweet content is required");
  }

  let trimmedContent = content.trim();

  if ([...trimmedContent].length > 320) {
    throw new ApiError(400, "Tweet content cannot exceed 320 characters");
  }

  const updatedTweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: req.user?._id },
    {
      $set: {
        content: trimmedContent,
        hashtags: extractHashtags(trimmedContent),
      },
    },
    { new: true, runValidators: true }
  );

  if (!updatedTweet) {
    const tweetExists = await Tweet.findById(tweetId);

    if (!tweetExists) {
      throw new ApiError(404, "Tweet not found");
    }

    throw new ApiError(403, "You do not have permission to update this tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

// router.route("/:tweetId").delete(deleteTweet)
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  console.log(tweetId);

  if (!req.user?._id) {
    throw new ApiError(401, "Authentication required to delete a tweet");
  }

  ensureValidTweet(tweetId);

  const deletedRes = await Tweet.deleteOne({
    _id: tweetId,
    owner: req.user._id,
  });

  if (deletedRes.deletedCount === 0) {
    const tweetExists = await Tweet.findById(tweetId);

    if (!tweetExists) {
      throw new ApiError(404, "Tweet not found");
    }

    throw new ApiError(403, "You do not have permission to delete this tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

// router.route("/user/:userId").get(getUserTweets)
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const currentCursor = req.query.nextCursor;
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);

  const matchFilter = { owner: new mongoose.Types.ObjectId(userId) };
  if (currentCursor) {
    if (!mongoose.isValidObjectId(currentCursor)) {
      throw new ApiError(400, "Invalid cursor");
    }
    matchFilter._id = { $lt: new mongoose.Types.ObjectId(currentCursor) };
  }

  const currentUserId = getOptionalCurrentUserId(req);

  const tweets = await Tweet.aggregate([
    { $match: matchFilter },
    { $sort: { _id: -1 } },
    { $limit: limit + 1 },
    ...buildTweetEnrichmentStages(currentUserId),
  ]);

  const hasNextPage = tweets.length > limit;
  if (hasNextPage) {
    tweets.pop();
  }

  const nextCursor = hasNextPage ? tweets[tweets.length - 1]._id : null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tweets,
        pagination: {
          nextCursor,
          hasNextPage,
          limit,
        },
      },
      "User tweets fetched successfully"
    )
  );
});

const getTweetById = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  ensureValidTweet(tweetId);

  const currentUserId = getOptionalCurrentUserId(req);

  const tweet = await Tweet.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(tweetId) },
    },
    ...buildTweetEnrichmentStages(currentUserId),
  ]);

  if (!tweet || tweet.length === 0) {
    throw new ApiError(404, "Tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet[0], "Tweet fetched successfully"));
});

const VIEW_DEDUPE_WINDOW_MS = 60 * 60 * 1000;

const recordTweetView = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  ensureValidTweet(tweetId);

  const existingTweet = await Tweet.findById(tweetId).select("views").lean();
  if (!existingTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const viewerKey = req.user?._id
    ? `user:${req.user._id}`
    : `ip:${req.ip || req.socket?.remoteAddress || "unknown"}`;

  let counted = false;

  try {
    await TweetViewLog.create({ tweetId, viewerKey });
    counted = true;
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    const cutoff = new Date(Date.now() - VIEW_DEDUPE_WINDOW_MS);
    const refreshedLog = await TweetViewLog.findOneAndUpdate(
      {
        tweetId,
        viewerKey,
        createdAt: { $lte: cutoff },
      },
      { $set: { createdAt: new Date() } },
      { new: true }
    ).lean();

    counted = Boolean(refreshedLog);
  }

  if (!counted) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          views: existingTweet.views ?? 0,
          counted: false,
        },
        "Tweet view deduplicated"
      )
    );
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { $inc: { views: 1 } },
    { new: true, projection: { views: 1 } }
  ).lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        views: updatedTweet?.views ?? (existingTweet.views ?? 0) + 1,
        counted: true,
      },
      "Tweet view recorded successfully"
    )
  );
});

export {
  createTweet,
  updateTweet,
  deleteTweet,
  getAllTweets,
  getUserTweets,
  getTweetById,
  recordTweetView,
};
