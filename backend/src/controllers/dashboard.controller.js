import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  const [subscriberCount, channelStats] = await Promise.all([
    Subscription.countDocuments({ channel: ownerObjectId }),
    Video.aggregate([
      {
        $match: { owner: ownerObjectId },
      },
      {
        $lookup: {
          from: "comments",
          let: { videoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$targetId", "$$videoId"] },
                    { $eq: ["$targetType", "Video"] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "commentStats",
        },
      },
      {
        $lookup: {
          from: "likes",
          let: { videoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$targetId", "$$videoId"] },
                    { $eq: ["$targetType", "Video"] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "likeStats",
        },
      },
      {
        $group: {
          _id: null,
          videos: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalComments: {
            $sum: { $ifNull: [{ $first: "$commentStats.count" }, 0] },
          },
          totalLikes: {
            $sum: { $ifNull: [{ $first: "$likeStats.count" }, 0] },
          },
        },
      },
    ]),
  ]);

  const statsData = channelStats[0] || {};

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos: statsData.videos || 0,
        totalViews: statsData.totalViews || 0,
        subscriberCount,
        totalComments: statsData.totalComments || 0,
        totalLikes: statsData.totalLikes || 0,
      },
      "Channel stats retrieved successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
    100
  );

  const aggregate = Video.aggregate([
    { 
      // 1. Filter by owner immediately to leverage indexing
      $match: { owner: new mongoose.Types.ObjectId(ownerId) } 
    },
    { 
      // 2. Lookup total comments for each video
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments"
      }
    },
    { 
      // 3. Lookup total likes for each video
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "targetId",
        as: "likes"
      }
    },
    {
      // 4. Transform data and project metrics
      $project: {
        title: 1,
        thumbnail: 1,
        views: 1,
        isPublished: 1,
        duration: 1,
        createdAt: 1,
        commentCount: { $size: "$comments" },
        likeCount: {
          $size: {
            $filter: {
              input: "$likes",
              as: "like",
              cond: { $eq: ["$$like.targetType", "Video"] }
            }
          }
        }
      }
    },
    { 
      // 5. Sort by latest upload
      $sort: { createdAt: -1 } 
    }
  ]);

  // AggregatePaginate processes the aggregate pipeline efficiently with limits
  const videos = await Video.aggregatePaginate(aggregate, { page, limit });

  return res
    .status(200)
    .json(
      new ApiResponse(200, videos, "Channel videos retrieved successfully")
    );
});


export { getChannelStats, getChannelVideos };
