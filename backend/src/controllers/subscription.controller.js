import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { Subscription } from "../models/subscription.model.js";
import { Video } from "../models/video.model.js";

const ensureValidObject = (id, name = "id") => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${name}`);
  }
};

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  ensureValidObject(channelId, "channel id");

  const subscribedTo = await Subscription.aggregate([
    {
      $match: { subscriber: new mongoose.Types.ObjectId(channelId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelDetails",
      },
    },
    {
      $unwind: {
        path: "$channelDetails",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        _id: "$channelDetails._id",
        channelName: "$channelDetails.fullName",
        channelAvatar: "$channelDetails.avatar",
      },
    },
  ]);

  if (!subscribedTo || subscribedTo.length === 0) {
    throw new ApiError(404, "No subscriptions found for this channel");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedTo,
        "Subscribed channels retrieved successfully"
      )
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  ensureValidObject(channelId, "channel id");

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const subscribersData = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(channelId) },
    },

    {
      $facet: {
        metaData: [{ $count: "subscribersCount" }],
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "users",
              localField: "subscriber",
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
              as: "subscriberDetails",
            },
          },
          {
            $replaceRoot: {
              newRoot: { $arrayElemAt: ["$subscriberDetails", 0] },
            },
          },
        ],
      },
    },
  ]);

  const totalSubscribers =
    subscribersData[0]?.metaData[0]?.subscribersCount || 0;

  const subscribers = subscribersData[0]?.data || [];

  if (totalSubscribers === 0 || subscribers.length === 0) {
    throw new ApiError(404, "No subscribers found for this channel");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        subscribers,
        pagination: {
          totalSubscribers,
          currentPage: page,
          totalPages: Math.ceil(totalSubscribers / limit),
          limit,
        },
      },
      "Channel subscribers retrieved successfully"
    )
  );
});

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user?._id;

  ensureValidObject(channelId, "channel id");
  ensureValidObject(subscriberId, "subscriber id");

  if (channelId.toString() === subscriberId.toString()) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: subscriberId,
    channel: new mongoose.Types.ObjectId(channelId),
  });

  if (existingSubscription) {
    await existingSubscription.deleteOne();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { channelId, subscribed: false },
          "Unsubscribed successfully"
        )
      );
  }

  const subscription = await Subscription.create({
    subscriber: subscriberId,
    channel: new mongoose.Types.ObjectId(channelId),
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { subscription, subscribed: true },
        "Subscribed successfully"
      )
    );
});

const parsePagination = (query, defaultLimit) => {
  const parsedOffset = Number.parseInt(query.offset, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);
  const offset = Number.isNaN(parsedOffset) ? 0 : Math.max(0, parsedOffset);
  const limit = Number.isNaN(parsedLimit)
    ? defaultLimit
    : Math.min(50, Math.max(1, parsedLimit));
  return { offset, limit };
};

const getMySubscribedChannels = asyncHandler(async (req, res) => {
  const { offset, limit } = parsePagination(req.query, 4);

  const [subscriptions, totalCount] = await Promise.all([
    Subscription.find({ subscriber: req.user._id })
      .sort({ createdAt: -1, _id: -1 })
      .skip(offset)
      .limit(limit)
      .populate("channel", "username fullName avatar")
      .lean(),
    Subscription.countDocuments({ subscriber: req.user._id }),
  ]);

  const channels = subscriptions
    .filter((sub) => sub.channel)
    .map((sub) => ({
      _id: sub.channel._id,
      username: sub.channel.username,
      fullName: sub.channel.fullName,
      avatar: sub.channel.avatar,
    }));

  const hasMore = offset + subscriptions.length < totalCount;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        channels,
        totalCount,
        hasMore,
      },
      "Subscribed channels retrieved successfully"
    )
  );
});

const getSubscriptionsFeed = asyncHandler(async (req, res) => {
  const { offset, limit } = parsePagination(req.query, 20);
  const currentUserId = new mongoose.Types.ObjectId(req.user._id);

  const channelIds = await Subscription.distinct("channel", {
    subscriber: currentUserId,
  });

  if (!channelIds.length) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          items: [],
          hasMore: false,
          nextOffset: null,
        },
        "Subscriptions feed fetched successfully"
      )
    );
  }

  const items = await Video.aggregate([
    {
      $match: {
        owner: { $in: channelIds },
        isPublished: true,
      },
    },
    {
      $project: {
        _id: 1,
        feedType: { $literal: "video" },
        createdAt: 1,
        owner: 1,
        title: 1,
        thumbnail: 1,
        duration: 1,
        views: 1,
      },
    },
    {
      $unionWith: {
        coll: "tweets",
        pipeline: [
          {
            $match: {
              owner: { $in: channelIds },
            },
          },
          {
            $project: {
              _id: 1,
              feedType: { $literal: "tweet" },
              createdAt: 1,
              owner: 1,
              content: 1,
              views: { $ifNull: ["$views", 0] },
            },
          },
        ],
      },
    },
    { $sort: { createdAt: -1, _id: -1 } },
    { $skip: offset },
    { $limit: limit + 1 },
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
      $lookup: {
        from: "likes",
        let: { itemId: "$_id", itemType: "$feedType" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$$itemType", "tweet"] },
                  { $eq: ["$targetId", "$$itemId"] },
                  { $eq: ["$targetType", "Tweet"] },
                ],
              },
            },
          },
          { $project: { likedBy: 1 } },
        ],
        as: "tweetLikes",
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
                  { $eq: ["$$itemType", "tweet"] },
                  { $eq: ["$targetId", "$$itemId"] },
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
        as: "tweetCommentThreads",
      },
    },
    {
      $addFields: {
        owner: { $first: "$ownerDetails" },
        likesCount: {
          $cond: [
            { $eq: ["$feedType", "tweet"] },
            { $size: "$tweetLikes" },
            "$$REMOVE",
          ],
        },
        commentsCount: {
          $cond: [
            { $eq: ["$feedType", "tweet"] },
            { $sum: "$tweetCommentThreads.total" },
            "$$REMOVE",
          ],
        },
        isLiked: {
          $cond: [
            { $eq: ["$feedType", "tweet"] },
            { $in: [currentUserId, "$tweetLikes.likedBy"] },
            "$$REMOVE",
          ],
        },
      },
    },
    {
      $project: {
        ownerDetails: 0,
        tweetLikes: 0,
        tweetCommentThreads: 0,
      },
    },
  ]);

  const hasMore = items.length > limit;
  if (hasMore) {
    items.pop();
  }
  const nextOffset = hasMore ? offset + items.length : null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        items,
        hasMore,
        nextOffset,
      },
      "Subscriptions feed fetched successfully"
    )
  );
});

export {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
  getMySubscribedChannels,
  getSubscriptionsFeed,
};
