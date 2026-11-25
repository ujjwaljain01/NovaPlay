import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import {
  EXPLORE_CATEGORY_TAGS,
  VALID_EXPLORE_CATEGORIES,
} from "../utils/hashtags.js";

const VALID_TYPES = new Set(["all", "videos", "tweets"]);

const getOptionalCurrentUserId = (req) =>
  req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

const buildOwnerLookupStages = () => [
  {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            _id: 1,
            username: 1,
            fullName: 1,
            avatar: 1,
          },
        },
      ],
      as: "ownerDetails",
    },
  },
  {
    $addFields: {
      owner: { $first: "$ownerDetails" },
    },
  },
  {
    $project: {
      ownerDetails: 0,
    },
  },
];

const buildEngagementLookupStages = (currentUserId, includeTweetIsLiked) => [
  {
    $lookup: {
      from: "likes",
      let: { itemId: "$_id", itemType: "$feedType" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$targetId", "$$itemId"] },
                {
                  $eq: [
                    "$targetType",
                    {
                      $cond: [
                        { $eq: ["$$itemType", "video"] },
                        "Video",
                        "Tweet",
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        { $project: { likedBy: 1 } },
      ],
      as: "itemLikes",
    },
  },
  {
    $lookup: {
      from: "comments",
      let: { itemId: "$_id", itemType: "$feedType" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$targetId", "$$itemId"] },
                {
                  $eq: [
                    "$targetType",
                    {
                      $cond: [
                        { $eq: ["$$itemType", "video"] },
                        "Video",
                        "Tweet",
                      ],
                    },
                  ],
                },
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
      as: "itemCommentThreads",
    },
  },
  {
    $addFields: {
      likesCount: {
        $cond: [
          { $eq: ["$feedType", "tweet"] },
          { $size: "$itemLikes" },
          "$$REMOVE",
        ],
      },
      commentsCount: {
        $cond: [
          { $eq: ["$feedType", "tweet"] },
          { $sum: "$itemCommentThreads.total" },
          "$$REMOVE",
        ],
      },
      engagementLikes: { $size: "$itemLikes" },
      engagementComments: { $sum: "$itemCommentThreads.total" },
      isLiked: includeTweetIsLiked
        ? {
            $cond: [
              { $eq: ["$feedType", "tweet"] },
              currentUserId
                ? { $in: [currentUserId, "$itemLikes.likedBy"] }
                : false,
              "$$REMOVE",
            ],
          }
        : "$$REMOVE",
    },
  },
  {
    $project: {
      itemLikes: 0,
      itemCommentThreads: 0,
    },
  },
];

const getVideoProjectionStage = () => ({
  $project: {
    _id: 1,
    feedType: { $literal: "video" },
    createdAt: 1,
    owner: 1,
    title: 1,
    thumbnail: 1,
    duration: 1,
    views: { $ifNull: ["$views", 0] },
    hashtags: { $ifNull: ["$hashtags", []] },
  },
});

const getTweetProjectionStage = () => ({
  $project: {
    _id: 1,
    feedType: { $literal: "tweet" },
    createdAt: 1,
    owner: 1,
    content: 1,
    views: { $ifNull: ["$views", 0] },
    hashtags: { $ifNull: ["$hashtags", []] },
  },
});

const getExploreFeed = asyncHandler(async (req, res) => {
  const category = String(req.params.category || "").trim().toLowerCase();
  if (!VALID_EXPLORE_CATEGORIES.includes(category)) {
    throw new ApiError(
      400,
      `Invalid explore category "${category}". Supported categories: ${VALID_EXPLORE_CATEGORIES.join(", ")}`
    );
  }

  const type = String(req.query.type || "all").trim().toLowerCase();
  if (!VALID_TYPES.has(type)) {
    throw new ApiError(
      400,
      'Invalid type filter. Supported values: "all", "videos", "tweets"'
    );
  }

  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 12)
  );
  const skip = (page - 1) * limit;
  const currentUserId = getOptionalCurrentUserId(req);

  const isTrending = category === "trending";
  const categoryTags = isTrending ? null : EXPLORE_CATEGORY_TAGS[category];

  const videoMatch = { isPublished: true };
  const tweetMatch = {};

  if (categoryTags) {
    videoMatch.hashtags = { $in: categoryTags };
    tweetMatch.hashtags = { $in: categoryTags };
  }

  let baseModel = Video;
  const pipeline = [];

  if (type === "videos") {
    baseModel = Video;
    pipeline.push({ $match: videoMatch }, getVideoProjectionStage());
  } else if (type === "tweets") {
    baseModel = Tweet;
    pipeline.push({ $match: tweetMatch }, getTweetProjectionStage());
  } else {
    baseModel = Video;
    pipeline.push(
      { $match: videoMatch },
      getVideoProjectionStage(),
      {
        $unionWith: {
          coll: "tweets",
          pipeline: [{ $match: tweetMatch }, getTweetProjectionStage()],
        },
      }
    );
  }

  if (isTrending) {
    pipeline.push(
      {
        $addFields: {
          hoursSincePublished: {
            $max: [
              0,
              {
                $divide: [{ $subtract: ["$$NOW", "$createdAt"] }, 3600000],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          velocityScore: {
            $divide: [
              "$views",
              { $pow: [{ $add: ["$hoursSincePublished", 2] }, 1.5] },
            ],
          },
        },
      },
      { $sort: { velocityScore: -1, createdAt: -1, _id: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            ...buildOwnerLookupStages(),
            ...buildEngagementLookupStages(currentUserId, true),
            {
              $project: {
                hoursSincePublished: 0,
                engagementLikes: 0,
                engagementComments: 0,
              },
            },
          ],
        },
      }
    );
  } else {
    pipeline.push(
      ...buildEngagementLookupStages(currentUserId, true),
      {
        $addFields: {
          hoursSincePublished: {
            $max: [
              0,
              {
                $divide: [{ $subtract: ["$$NOW", "$createdAt"] }, 3600000],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          categoryScore: {
            $divide: [
              {
                $add: [
                  1,
                  { $multiply: ["$views", 0.1] },
                  { $multiply: ["$engagementLikes", 3] },
                  { $multiply: ["$engagementComments", 5] },
                ],
              },
              { $pow: [{ $add: ["$hoursSincePublished", 2] }, 0.8] },
            ],
          },
        },
      },
      { $sort: { categoryScore: -1, createdAt: -1, _id: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            ...buildOwnerLookupStages(),
            {
              $project: {
                hoursSincePublished: 0,
                engagementLikes: 0,
                engagementComments: 0,
              },
            },
          ],
        },
      }
    );
  }

  const aggregated = await baseModel.aggregate(pipeline);
  const totalResults = aggregated[0]?.metadata[0]?.total || 0;
  const items = aggregated[0]?.data || [];

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        category,
        type,
        items,
        page,
        limit,
        totalResults,
        hasNextPage: skip + items.length < totalResults,
      },
      `Explore ${category} feed fetched successfully`
    )
  );
});

export { getExploreFeed };
