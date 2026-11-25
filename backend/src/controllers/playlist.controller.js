import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const ensureValidObjectId = (id, name = "id") => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${name}`);
  }
};

const ensurePlaylistOwner = (playlist, userId) => {
  if (!playlist.owner || playlist.owner.toString() !== userId?.toString()) {
    throw new ApiError(403, "You are not allowed to modify this playlist");
  }
};

const sanitizeText = (text) => (typeof text === "string" ? text.trim() : "");

//router.route("/").post(createPlaylist);
const createPlaylist = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Authentication required to create a playlist");
  }

  const name = sanitizeText(req.body?.name);
  const description = sanitizeText(req.body?.description);

  if (!name) {
    throw new ApiError(400, "Playlist name is required");
  }

  if (!description) {
    throw new ApiError(400, "Playlist description is required");
  }

  const existingPlaylist = await Playlist.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
    owner: req.user._id,
  });

  if (existingPlaylist) {
    throw new ApiError(409, "A playlist with this name already exists");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(500, "Failed to create playlist");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

//router.route("/:playlistId").get(getPlaylistById);
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  ensureValidObjectId(playlistId, "playlist id");

  const playlist = await Playlist.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(playlistId) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    _id: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$ownerDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              thumbnail: 1,
              duration: 1,
              owner: "$ownerDetails",
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
        as: "playlistOwnerDetails",
        pipeline: [
          {
            $project: {
              avatar: 1,
              fullName: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$playlistOwnerDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        videos: "$videoDetails",
        owner: "$playlistOwnerDetails",
      },
    },
  ]);

  if (!playlist || playlist.length === 0) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
});

//router.route("/:playlistId").patch(updatePlaylist);
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  ensureValidObjectId(playlistId, "playlist id");

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  ensurePlaylistOwner(playlist, req.user?._id);

  const name =
    req.body?.name !== undefined ? sanitizeText(req.body.name) : undefined;
  const description =
    req.body?.description !== undefined
      ? sanitizeText(req.body.description)
      : undefined;

  if (name === undefined && description === undefined) {
    throw new ApiError(
      400,
      "At least one field (name or description) is required"
    );
  }

  if (name !== undefined) {
    if (!name) {
      throw new ApiError(400, "Playlist name cannot be empty");
    }

    const duplicate = await Playlist.findOne({
      _id: { $ne: playlistId },
      owner: req.user._id,
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (duplicate) {
      throw new ApiError(409, "A playlist with this name already exists");
    }

    playlist.name = name;
  }

  if (description !== undefined) {
    if (!description) {
      throw new ApiError(400, "Playlist description cannot be empty");
    }

    playlist.description = description;
  }

  const updatedPlaylist = await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

//router.route("/:playlistId").delete(deletePlaylist);
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  ensureValidObjectId(playlistId, "playlist id");

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  ensurePlaylistOwner(playlist, req.user?._id);

  await playlist.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

//router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  ensureValidObjectId(videoId, "video id");
  ensureValidObjectId(playlistId, "playlist id");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  ensurePlaylistOwner(playlist, req.user?._id);

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (playlist.videos.some((id) => id.toString() === videoId)) {
    throw new ApiError(409, "Video already exists in the playlist");
  }

  playlist.videos.push(video._id);
  const updatedPlaylist = await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video added to playlist successfully"
      )
    );
});

//router.route()
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  ensureValidObjectId(videoId, "video id");
  ensureValidObjectId(playlistId, "playlist id");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  ensurePlaylistOwner(playlist, req.user?._id);

  if (!playlist.videos.some((id) => id.toString() === videoId)) {
    throw new ApiError(404, "Video not found in the playlist");
  }

  playlist.videos = playlist.videos.filter((id) => id.toString() !== videoId);
  const updatedPlaylist = await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video removed from playlist successfully"
      )
    );
});

//router.route("/user/:userId").get(getUserPlaylists);
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  ensureValidObjectId(userId, "user id");

  const playlists = await Playlist.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "videos",
        let: { firstVideoId: { $arrayElemAt: ["$videos", 0] } },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$firstVideoId"] } } },
          { $project: { _id: 0, thumbnail: 1 } },
        ],
        as: "firstVideo",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        owner: 1,
        totalVideos: { $size: "$videos" },
        firstVideoThumbnail: { $arrayElemAt: ["$firstVideo.thumbnail", 0] },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

export {
  createPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists,
};
