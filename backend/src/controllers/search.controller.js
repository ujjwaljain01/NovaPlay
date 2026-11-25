import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Playlist } from "../models/playlist.model.js";
import { EXPLORE_CATEGORY_TAGS, normalizeTag } from "../utils/hashtags.js";

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
      tag = "",
      page = 1,
      limit = 10,
      type = "all", // values: all, video, channel, playlist, tweets
      date = "anytime",
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (parsedPage - 1) * parsedLimit;
    const dateRange = getDateFilter(date);

    const trimmedQ = typeof q === "string" ? q.trim() : "";
    const explicitTag = normalizeTag(tag);
    const activeTag =
      explicitTag || (trimmedQ.startsWith("#") ? normalizeTag(trimmedQ) : "");
    const lowerQ = trimmedQ.toLowerCase();
    const categoryTags =
      !activeTag && EXPLORE_CATEGORY_TAGS[lowerQ]
        ? EXPLORE_CATEGORY_TAGS[lowerQ]
        : null;

    // MongoDB forbids $meta: "textScore" when $text is omitted or combined inside $or.
    const useTextScore = Boolean(trimmedQ && !activeTag && !categoryTags);
    const sortStage = useTextScore
      ? { score: { $meta: "textScore" }, createdAt: -1 }
      : { createdAt: -1 };

    // ----------------------------------------------------
    // CASE 1: Default View ("all") -> Videos + Tweets Union
    // ----------------------------------------------------
    if (type === "all") {
      const videoMatch = { isPublished: true };
      const tweetMatch = {};

      if (activeTag) {
        videoMatch.hashtags = activeTag;
        tweetMatch.hashtags = activeTag;
      } else if (categoryTags) {
        videoMatch.$or = [
          { hashtags: { $in: categoryTags } },
          { $text: { $search: trimmedQ } },
        ];
        tweetMatch.$or = [
          { hashtags: { $in: categoryTags } },
          { $text: { $search: trimmedQ } },
        ];
      } else if (trimmedQ) {
        videoMatch.$text = { $search: trimmedQ };
        tweetMatch.$text = { $search: trimmedQ };
      }

      if (dateRange) {
        videoMatch.createdAt = dateRange;
        tweetMatch.createdAt = dateRange;
      }

      const aggregationResult = await Video.aggregate([
        { $match: videoMatch },
        ...(useTextScore
          ? [{ $addFields: { score: { $meta: "textScore" } } }]
          : []),
        { $addFields: { contentType: "video" } },
        {
          $unionWith: {
            coll: "tweets",
            pipeline: [
              { $match: tweetMatch },
              ...(useTextScore
                ? [{ $addFields: { score: { $meta: "textScore" } } }]
                : []),
              {
                $addFields: {
                  contentType: "tweet",
                  views: { $ifNull: ["$views", 0] },
                },
              },
            ],
          },
        },
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

    const supportsHashtags = type === "video" || type === "tweets";

    if (activeTag) {
      if (!supportsHashtags) {
        return res.status(200).json({
          success: true,
          data: {
            results: [],
            page: parsedPage,
            hasNextPage: false,
            totalResults: 0,
          },
        });
      }
      matchStage.hashtags = activeTag;
    } else if (categoryTags && supportsHashtags) {
      matchStage.$or = [
        { hashtags: { $in: categoryTags } },
        { $text: { $search: trimmedQ } },
      ];
    } else if (trimmedQ) {
      matchStage.$text = { $search: trimmedQ };
    }

    if (dateRange && type !== "channel") matchStage.createdAt = dateRange;

    const pipeline = [{ $match: matchStage }];
    const useSingleTextScore = Boolean(
      trimmedQ &&
        !activeTag &&
        !(categoryTags && supportsHashtags)
    );

    if (useSingleTextScore) {
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
            contentType: type === "tweets" ? "tweet" : type,
            ...(type === "tweets" ? { views: { $ifNull: ["$views", 0] } } : {}),
          },
        },
        { $project: { ownerDetails: 0 } }
      );
    } else {
      const channelProject = {
        _id: 1,
        username: 1,
        fullName: 1,
        avatar: 1,
        createdAt: 1,
      };
      if (useSingleTextScore) {
        channelProject.score = { $meta: "textScore" };
      }

      pipeline.push(
        { $project: channelProject },
        { $addFields: { contentType: "channel" } }
      );
    }

    pipeline.push({
      $sort: useSingleTextScore
        ? { score: { $meta: "textScore" }, createdAt: -1 }
        : { createdAt: -1 },
    });

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
