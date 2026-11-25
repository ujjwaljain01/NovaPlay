import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const ownerId = req.user?._id;

  if (!ownerId) {
      throw new ApiError(401, "Unauthorized request");
  }

  const channelStats = await Video.aggregate([
      {
          $match: { owner: ownerId }
      },
      {
          $lookup: {
              from: "subscriptions",
              localField: "owner",
              foreignField: "channel",
              as: "subscribers"
          }
      },
      {
          $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "targetId",
              as: "comments"
          }
      },
      {
          $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "targetId",
              as: "likes"
          }
      },
      {
          $facet: {
              videoStats: [
                  {
                      $group: {
                          _id: null,
                          totalVideos: { $sum: 1 },
                          totalViews: { $sum: "$views" }
                      }
                  }
              ],
              subscribersCount: [
                  {
                      $project: { subscribers: 1 }
                  },
                  { $unwind: "$subscribers" },
                  { $group: { _id: null, count: { $sum: 1 } } }
              ],
              commentsCount: [
                  {
                      $project: { comments: 1 }
                  },
                  { $unwind: "$comments" },
                  { $group: { _id: null, count: { $sum: 1 } } }
              ],
              likesCount: [
                  {
                      $project: { likes: 1 }
                  },
                  { $unwind: "$likes" },
                  { $group: { _id: null, count: { $sum: 1 } } }
              ]
          }
      }
  ]);

  // Format the flattened result
  const statsData = channelStats[0];
  
  const videosCount = statsData.videoStats[0]?.totalVideos || 0;
  const totalViews = statsData.videoStats[0]?.totalViews || 0;
  const subscriberCount = statsData.subscribersCount[0]?.count || 0;
  const totalComments = statsData.commentsCount[0]?.count || 0;
  const totalLikes = statsData.likesCount[0]?.count || 0;

  return res.status(200).json(
      new ApiResponse(
          200,
          {
              videos: videosCount,
              totalViews,
              subscriberCount,
              totalComments,
              totalLikes
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
