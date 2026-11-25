import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "Something went wrong while generating refresh and access token"
    );
  }
};

// router.post("/register", memoryUpload().fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), registerUser);
const registerUser = asyncHandler(async (req, res) => {
  // Extract all details directly from req.body (no req.files anymore)
  const {
    username,
    fullName,
    email,
    password,
    avatar, // R2 URL from frontend
    coverImage, // R2 URL from frontend
    avatarPublicId, // R2 Object Key
    coverImagePublicId, // R2 Object Key
  } = req.body || {};

  if (
    [fullName, username, email, password].some(
      (field) => typeof field != "string" || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with username or email already exists");
  }

  // Frontend handles the upload, so we just verify it sent us the avatar data back
  if (!avatar || !avatarPublicId) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar, // Store the R2 URL
    coverImage: coverImage || "",
    avatarPublicId: avatarPublicId, // Store the R2 Key for future deletions
    coverImagePublicId: coverImagePublicId || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// router.post("/login", loginUser);
const loginUser = asyncHandler(async (req, res) => {
  // req -> data
  // get username or email
  // validate email and pass
  // find the user
  // password check
  // access and refresh token
  // if correct login
  // send cookie
  // return user

  const { email, username, password } = req.body;

  if (!username && !email)
    throw new ApiError(100, "username or email required");

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) throw new ApiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid User Credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        "User Logged in successfully"
      )
    );
});

// router.post("/logout", verifyJWT, logoutUser);
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    $set: {
      refreshToken: undefined,
    },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

// router.post("/refresh-token", refreshAccessToken);
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized Request");

  try {
    const decodeToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodeToken?._id);

    if (!user) throw new ApiError(401, "Invalid Refresh Token");

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

// router.post("/change-password", verifyJWT, changeCurrentPassword);
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    throw new ApiError(400, "Old or new password are required");

  const user = await User.findById(req.user?._id);

  if (!user) throw new ApiError(400, "User is missing");

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) throw new ApiError(400, "Invalid old password");

  user.passowrd = newPassword;

  await user.save({ vallidateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// router.get("/current-user", verifyJWT, getCurrentUser);
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

// router.patch("/update-account", verifyJWT, updateAccountDetails);
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) throw new ApiError(400, "All fields are required");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { returnDocument: "after" }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated Successfully"));
});

// router.patch("/avatar", verifyJWT, memoryUpload().single("avatar"), updateUserAvatar);
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is missing");

  const avatar = await uploadOnCloudinary(avatarLocalPath, "avatar");

  if (!avatar.url) throw new ApiError(400, "Error while uploading on avatar");

  const previousUser = await User.findById(req.user._id);

  await deleteFromCloudinary(previousUser?.avatarPublicId);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar.url },
    },
    { returnDocument: "after" }
  ).select("-password");

  if (!updatedUser) {
    await deleteFromCloudinary(avatar.public_id, "image");
    throw new ApiError(400, "Error while updating the user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar is updated successfully"));
});

// router.patch("/coverImage", verifyJWT, memoryUpload().single("coverImage"), updateUserCoverImage);
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath)
    throw new ApiError(400, "Cover Image file is missing");

  const previousUser = await User.findById(req.user._id);

  if (previousUser.coverImagePublicId) {
    await deleteFromCloudinary(previousUser.coverImagePublicId, "image");
  }

  const coverImage = await uploadOnCloudinary(
    coverImageLocalPath,
    "coverImage"
  );

  if (!coverImage.url)
    throw new ApiError(400, "Error while uploading on avatar");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { coverImage: coverImage.url },
      $set: { coverImagePublicId: coverImage.public_id },
    },
    { returnDocument: "after" }
  ).select("-password");

  if (!user) {
    await deleteFromCloudinary(coverImage.public_id, "image");
    throw new ApiError(400, "Error while updating the user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image is updated successfully"));
});

// router.get("/c/:username", verifyJWT, getUserChannelProfile);
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        ChannelsSubscriberToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: req.user?._id
          ? {
              $cond: {
                if: {
                  $in: [
                    new mongoose.Types.ObjectId(req.user._id),
                    "$subscribers.subscriber",
                  ],
                },
                then: true,
                else: false,
              },
            }
          : false,
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        ChannelsSubscriberToCount: 1,
        isSubscribed: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!channel?.length) throw new ApiError(404, "channel does not exist");

  console.log(channel);

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel is fetched successfully")
    );
});

// router.get("/c/:username/videos", getUserChannelVideos);
const getUserChannelVideos = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  const channelUser = await User.findOne({
    username: username.trim().toLowerCase(),
  }).select("_id");

  if (!channelUser) {
    throw new ApiError(404, "Channel does not exist");
  }

  const limit = Math.min(100, Number.parseInt(req.query.limit, 10) || 10);
  const { nextCursor } = req.query;

  const matchFilter = {
    owner: channelUser._id,
    isPublished: true,
  };

  if (nextCursor) {
    if (!mongoose.isValidObjectId(nextCursor)) {
      throw new ApiError(400, "Invalid cursor id");
    }
    matchFilter._id = { $lt: new mongoose.Types.ObjectId(nextCursor) };
  }

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
      $addFields: {
        likeCount: {
          $ifNull: [{ $first: "$likeStats.count" }, 0],
        },
      },
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
        likeCount: 1,
        createdAt: 1,
        updatedAt: 1,
        "owner._id": 1,
        "owner.username": 1,
        "owner.fullName": 1,
        "owner.avatar": 1,
      },
    },
  ]);

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
      "Channel videos fetched successfully"
    )
  );
});

// router.get("/history", verifyJWT, getWatchHistory);
const getWatchHistory = asyncHandler(async (req, res) => {
  const watchHistory = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $unwind: {
        path: "$watchHistory",
        includeArrayIndex: "historyOrder",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "video",
        pipeline: [
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
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$owner",
          },
        ],
      },
    },
    {
      $unwind: "$video",
    },
    {
      $sort: { historyOrder: 1 },
    },
    {
      $replaceRoot: {
        newRoot: "$video",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        watchHistory ?? [],
        "Watch history fetched successfully"
      )
    );
});

// router.patch("/history", verifyJWT, addToWatchHistory);
const addToWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.body || {};

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const videoExists = await Video.exists({ _id: videoId });
  if (!videoExists) {
    throw new ApiError(404, "Video not found");
  }

  const videoObjectId = new mongoose.Types.ObjectId(videoId);

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { watchHistory: videoObjectId },
  });

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        watchHistory: {
          $each: [videoObjectId],
          $position: 0,
        },
      },
    },
    { returnDocument: "after", projection: { watchHistory: 1 } }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser?.watchHistory ?? [],
        "Watch history updated successfully"
      )
    );
});

const googleAuthCallback = asyncHandler(async (req, res) => {
  try {
    const googleUser = req.user;

    if (!googleUser) {
      throw new ApiError(400, "Google user data is missing");
    }

    console.log("Google User:", googleUser);

    const email = googleUser.emails[0].value;
    const googleId = googleUser.id;
    const fullName = googleUser.displayName;
    const avatar = googleUser.photos[0].value;

    const isEmailVerified = googleUser._json?.email_verified === true;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      const generatedUsername =
        email.split("@")[0] + Math.floor(1000 + Math.random() * 9000);

      user = await User.create({
        googleId,
        email,
        fullName,
        username: generatedUsername,
        avatar,
      });
    } else if (!user.googleId) {
      if (!isEmailVerified) {
        throw new ApiError(
          400,
          "Your Google email must be verified to link accounts automatically."
        );
      }

      user.googleId = googleId;
      if (!user.avatar && avatar) user.avatar = avatar; // Enriches profile if missing
      await user.save();
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "something went wrong while registering the user"
      );
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          createdUser,
          "User registered successfully via Google"
        )
      );
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error?.message || "Something went wrong during Google authentication"
    );
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getUserChannelVideos,
  getWatchHistory,
  addToWatchHistory,
  googleAuthCallback,
};
