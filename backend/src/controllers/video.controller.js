import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const ensureValidVideoId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid video id");
  }
};

const ensureOwner = (video, userId) => {
  if (!video.owner || video.owner.toString() !== userId?.toString()) {
    throw new ApiError(403, "You are not allowed to modify this video");
  }
};

// router.route("/").post(verifyJWT, publishVideo)
// Reads from req.body — files are uploaded to R2 by the client before this call.
const publishVideo = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    videoFile,
    videoPublicId,
    thumbnail,
    thumbnailPublicId,
    duration,
  } = req.body || {};

  if (
    typeof title !== "string" ||
    title.trim() === "" ||
    typeof description !== "string" ||
    description.trim() === ""
  ) {
    throw new ApiError(400, "Title and description are required");
  }

  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "videoFile and thumbnail URLs are required");
  }

  if (!videoPublicId || !thumbnailPublicId) {
    throw new ApiError(400, "videoPublicId and thumbnailPublicId are required");
  }

  const parsedDuration = Number(duration);
  if (!parsedDuration || parsedDuration <= 0) {
    throw new ApiError(400, "A valid duration is required");
  }

  const video = await Video.create({
    videoFile,
    videoPublicId,
    thumbnail,
    thumbnailPublicId,
    owner: req.user._id,
    title: title.trim(),
    description: description.trim(),
    duration: parsedDuration,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

// router.route("/:id").get(optionalVerifyJWT, getVideoById)
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  ensureValidVideoId(videoId);

  const videoObjectId = new mongoose.Types.ObjectId(videoId);
  const viewerId = req.user?._id
    ? new mongoose.Types.ObjectId(req.user._id)
    : null;

  const [video] = await Video.aggregate([
    {
      $match: { _id: videoObjectId },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
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
      },
    },
    {
      $unwind: "$owner",
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
          {
            $group: {
              _id: null,
              likeCount: { $sum: 1 },
              isLiked: {
                $max: viewerId
                  ? { $cond: [{ $eq: ["$likedBy", viewerId] }, 1, 0] }
                  : 0,
              },
            },
          },
        ],
        as: "likeStats",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        let: { channelId: "$owner._id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$channel", "$$channelId"] },
            },
          },
          {
            $group: {
              _id: null,
              subscribersCount: { $sum: 1 },
              isSubscribed: {
                $max: viewerId
                  ? { $cond: [{ $eq: ["$subscriber", viewerId] }, 1, 0] }
                  : 0,
              },
            },
          },
        ],
        as: "subscriptionStats",
      },
    },
    {
      $addFields: {
        likeCount: { $ifNull: [{ $first: "$likeStats.likeCount" }, 0] },
        isLiked: {
          $eq: [{ $ifNull: [{ $first: "$likeStats.isLiked" }, 0] }, 1],
        },
        isSubscribed: {
          $eq: [
            { $ifNull: [{ $first: "$subscriptionStats.isSubscribed" }, 0] },
            1,
          ],
        },
        "owner.subscribersCount": {
          $ifNull: [{ $first: "$subscriptionStats.subscribersCount" }, 0],
        },
      },
    },
    {
      $project: {
        likeStats: 0,
        subscriptionStats: 0,
      },
    },
  ]);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

// router.route("/").get(getAllVideos)
const getAllVideos = asyncHandler(async (req, res) => {
  const limit = Math.min(100, Number.parseInt(req.query.limit, 10) || 10);
  const { nextCursor } = req.query;

  // 1. Build a clean, dynamic match filter first
  const matchFilter = { isPublished: true };
  if (nextCursor) {
    matchFilter._id = { $lt: new mongoose.Types.ObjectId(nextCursor) };
  }

  // 2. Pass the entire pipeline directly as a clean, scannable array
  const videos = await Video.aggregate([
    {
      $match: matchFilter,
    },
    {
      $sort: { _id: -1 },
    },
    {
      $limit: limit + 1,
    },
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
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        updatedAt: 1,
        "owner._id": 1,
        "owner.username": 1,
        "owner.fullName": 1,
        "owner.avatar": 1,
      },
    },
  ]);

  // 3. Process infinite scroll evaluation
  const hasNextPage = videos.length > limit;
  if (hasNextPage) {
    videos.pop();
  }

  const lastVideo = videos[videos.length - 1];
  const endCursor = lastVideo ? lastVideo._id : null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        docs: videos,
        nextCursor: hasNextPage ? endCursor : null,
        hasNextPage,
      },
      "Videos fetched successfully for infinite scroll"
    )
  );
});

// router.route("/:id/assets").patch()
const updateVideoAssets = asyncHandler(async (req, res) => {
  ensureValidVideoId(req.params.videoId);

  const videoFile = req.files?.video?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  if (!videoFile && !thumbnailFile) {
    throw new ApiError(
      400,
      "Provide either a video file or a thumbnail to update"
    );
  }

  const video = await Video.findById(req.params.videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  ensureOwner(video, req.user?._id);

  let uploadedVideo = null;
  let uploadedThumbnail = null;
  const oldVideoPublicId = video.videoPublicId;
  const oldThumbnailPublicId = video.thumbnailPublicId;

  try {
    if (videoFile) {
      const duration = await getVideoDuration(videoFile.path);

      uploadedVideo = await uploadLargeOnCloudinary(videoFile.path, "video");
      if (!uploadedVideo) {
        throw new ApiError(500, "Failed to upload video file to Cloudinary");
      }

      video.videoFile = uploadedVideo.secure_url;
      video.videoPublicId = uploadedVideo.public_id;
      video.duration = duration;
    }

    if (thumbnailFile) {
      uploadedThumbnail = await uploadOnCloudinary(
        thumbnailFile.path,
        "thumbnail"
      );
      if (!uploadedThumbnail) {
        throw new ApiError(
          500,
          "Failed to upload thumbnail file to Cloudinary"
        );
      }

      video.thumbnail = uploadedThumbnail.secure_url;
      video.thumbnailPublicId = uploadedThumbnail.public_id;
    }

    await video.save();

    await Promise.all([
      uploadedVideo && oldVideoPublicId
        ? deleteFromCloudinary(oldVideoPublicId, "video")
        : Promise.resolve(),
      uploadedThumbnail && oldThumbnailPublicId
        ? deleteFromCloudinary(oldThumbnailPublicId, "image")
        : Promise.resolve(),
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video assets updated successfully"));
  } catch (error) {
    await Promise.all([
      uploadedVideo ? cleanupUpload(uploadedVideo, "video") : Promise.resolve(),
      uploadedThumbnail
        ? cleanupUpload(uploadedThumbnail, "image")
        : Promise.resolve(),
    ]);

    throw new ApiError(500, "Failed to update video assets", error.message);
  } finally {
    if (videoFile?.path && fs.existsSync(videoFile.path)) {
      try {
        fs.unlinkSync(videoFile.path);
      } catch (e) {
        console.error("Video unlink error:", e);
      }
    }
    if (thumbnailFile?.path && fs.existsSync(thumbnailFile.path)) {
      try {
        fs.unlinkSync(thumbnailFile.path);
      } catch (e) {
        console.error("Thumbnail unlink error:", e);
      }
    }
  }
});

// router.route("/:id/details").patch()
const updateVideoDetails = asyncHandler(async (req, res) => {
  ensureValidVideoId(req.params.videoId);

  const { title, description } = req.body || {};

  if (title === undefined && description === undefined) {
    throw new ApiError(400, "Provide either title or description to update");
  }

  const video = await Video.findById(req.params.videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  ensureOwner(video, req.user?._id);

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      throw new ApiError(400, "Title cannot be empty");
    }
    video.title = title.trim();
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.trim() === "") {
      throw new ApiError(400, "Description cannot be empty");
    }
    video.description = description.trim();
  }

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video details updated successfully"));
});

// router.route("/:id").delete(verifyJWT, deleteVideo)
const deleteVideo = asyncHandler(async (req, res) => {
  ensureValidVideoId(req.params.videoId);

  const video = await Video.findById(req.params.videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  ensureOwner(video, req.user?._id);

  await video.deleteOne();
  await Promise.all([
    deleteFromCloudinary(video.videoPublicId, "video"),
    deleteFromCloudinary(video.thumbnailPublicId, "image"),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

// router.route("/:id/toggle-publish").patch(verifyJWT, togglePublishStatus)
const togglePublishStatus = asyncHandler(async (req, res) => {
  ensureValidVideoId(req.params.videoId);

  const video = await Video.findById(req.params.videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  ensureOwner(video, req.user?._id);

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status updated successfully"));
});

//
const incrementViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  ensureValidVideoId(videoId);

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true, projection: { views: 1 } }
  );

  if (!updatedVideo) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo.views,
        "Video views incremented successfully"
      )
    );
});

export {
  publishVideo,
  getVideoById,
  getAllVideos,
  updateVideoAssets,
  updateVideoDetails,
  deleteVideo,
  togglePublishStatus,
  incrementViews,
};
