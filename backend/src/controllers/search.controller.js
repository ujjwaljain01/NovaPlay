import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Playlist } from "../models/playlist.model.js";

// Helper function using non-mutating date logic
const getDateFilter = (dateFilter) => {
  const now = new Date();
  switch (dateFilter) {
    case "today":
      return {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      };
    case "week":
      return { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    case "month":
      return {
        $gte: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      };
    case "year":
      return {
        $gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      };
    default:
      return null;
  }
};

export const globalSearch = async (req, res) => {
  try {
    const {
      q = "",
      page = 1,
      limit = 10,
      type = "all", // values: all, video, channel, playlist, tweets
      date = "anytime",
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.max(1, parseInt(limit, 10));
    const skip = (parsedPage - 1) * parsedLimit;
    const dateRange = getDateFilter(date);

    // Build base sorting strategies safely
    // FIX: MongoDB requires meta-sorts to be completely isolated or prioritized purely by text score metadata
    const sortStage = q ? { score: { $meta: "textScore" } } : { createdAt: -1 };

    // ----------------------------------------------------
    // CASE 1: Default View ("all") -> High-Performance Indexed Text Union
    // ----------------------------------------------------
    if (type === "all") {
      const videoMatch = { isPublished: true };
      const tweetMatch = {};

      if (q) {
        videoMatch.$text = { $search: q };
        tweetMatch.$text = { $search: q };
      }

      if (dateRange) {
        videoMatch.createdAt = dateRange;
        tweetMatch.createdAt = dateRange;
      }

      const aggregationResult = await Video.aggregate([
        { $match: videoMatch },
        ...(q ? [{ $addFields: { score: { $meta: "textScore" } } }] : []),
        { $addFields: { contentType: "video" } },
        {
          $unionWith: {
            coll: "tweets",
            pipeline: [
              { $match: tweetMatch },
              ...(q ? [{ $addFields: { score: { $meta: "textScore" } } }] : []),
              { $addFields: { contentType: "tweet" } },
            ],
          },
        },
        // Fast Index Lookups for Owner Details
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
          },
        },
        { $unwind: "$ownerDetails" },
        {
          $addFields: {
            owner: {
              _id: "$ownerDetails._id",
              username: "$ownerDetails.username",
              fullName: "$ownerDetails.fullName",
              avatar: "$ownerDetails.avatar",
            },
          },
        },
        { $project: { ownerDetails: 0 } },
        { $sort: sortStage },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: skip }, { $limit: parsedLimit }],
          },
        },
      ]);

      const totalResults = aggregationResult[0]?.metadata[0]?.total || 0;
      const results = aggregationResult[0]?.data || [];

      return res.status(200).json({
        success: true,
        data: {
          results,
          page: parsedPage,
          hasNextPage: skip + parsedLimit < totalResults,
          totalResults,
        },
      });
    }

    // ----------------------------------------------------
    // CASE 2: Single Dedicated Scope Filter Selected
    // ----------------------------------------------------
    let queryModel;
    const matchStage = {};

    if (type === "video") {
      queryModel = Video;
      matchStage.isPublished = true;
    } else if (type === "channel") {
      queryModel = User;
    } else if (type === "playlist") {
      queryModel = Playlist;
    } else if (type === "tweets") {
      queryModel = Tweet;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid type parameter filter" });
    }

    if (q) matchStage.$text = { $search: q };
    if (dateRange && type !== "channel") matchStage.createdAt = dateRange;

    const pipeline = [{ $match: matchStage }];

    if (q) {
      pipeline.push({ $addFields: { score: { $meta: "textScore" } } });
    }

    if (type !== "channel") {
      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
          },
        },
        { $unwind: "$ownerDetails" },
        {
          $addFields: {
            owner: {
              _id: "$ownerDetails._id",
              username: "$ownerDetails.username",
              fullName: "$ownerDetails.fullName",
              avatar: "$ownerDetails.avatar",
            },
            contentType: type,
          },
        },
        { $project: { ownerDetails: 0 } }
      );
    } else {
      // FIX: If channel profile matching, strip out sensitive data profiles like passwords
      pipeline.push(
        {
          $project: {
            _id: 1,
            username: 1,
            fullName: 1,
            avatar: 1,
            createdAt: 1,
            score: q ? { $meta: "textScore" } : undefined,
          },
        },
        {
          $addFields: { contentType: "channel" },
        }
      );
    }

    // FIX: Replaced crash-prone composite search sorting with dynamic sortStage definition
    pipeline.push({ $sort: sortStage });

    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: parsedLimit }],
      },
    });

    const singleModelAggregation = await queryModel.aggregate(pipeline);
    const totalDocs = singleModelAggregation[0]?.metadata[0]?.total || 0;
    const results = singleModelAggregation[0]?.data || [];

    return res.status(200).json({
      success: true,
      data: {
        results,
        page: parsedPage,
        hasNextPage: skip + parsedLimit < totalDocs,
        totalResults: totalDocs,
      },
    });
  } catch (error) {
    console.error("Global search error execution:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server search processing failed" });
  }
};
