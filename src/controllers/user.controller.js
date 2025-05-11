import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { cloudinaryUploader } from "../../services/cloudinary.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { DeleteLocalFile } from "../utils/DeleteUploadedFileFromLocal.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

export const registerController = asyncHandler(async (req, res) => {
  const { email, fullName, username, password } = req.body;

  // Taking response from ZOD
  const paths = Object.values(req.files)
    .flat()
    .map((file) => file.path);
  const avatarLocalPath = paths?.[0];
  const coveImageLocalPath = paths?.[1];

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    DeleteLocalFile(avatarLocalPath, coveImageLocalPath);
    throw new ApiError(409, "User with email or username is already exists");
  }

  const avatar = await cloudinaryUploader(avatarLocalPath);
  console.log(avatar);
  const coverImage = await cloudinaryUploader(coveImageLocalPath);

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something Went wrong while creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "Users created successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // DB query works on either email or username
  const queryConditionArr = [];

  if (email && email.trim() !== "") {
    queryConditionArr.push({ email });
  }
  if (username && username.trim() !== "") {
    queryConditionArr.push({ username });
  }

  if (queryConditionArr.length === 0) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: queryConditionArr,
  });

  if (!user) {
    throw new ApiError(404, "User Does not exits");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials");
  }

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
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged In successfully"
      )
    );
});

export const logOut = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user Logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorize access");
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid Token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refreshed token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message || "Invalid refresh token");
  }
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new Response(200, req.user, "Current user fetched successfully"));
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = User.findById(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details updated"));
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const avatar = await cloudinaryUploader(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while saving on cloud");
  }
  const user = findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Changed successfully"));
});

export const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Image file is missing");
  }
  const coverImage = await cloudinaryUploader(avatarLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while saving on cloud");
  }
  const user = findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Image Changed successfully"));
});

export const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new ApiError(400, "username is missing ");
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
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          if: { $in: [req.user?._id, "$subscribers.subscriber"] },
          then: true,
          else: false,
        },
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        userName: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exists");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel data fetched successfully")
    );
});

export const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "WatchHistory",
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
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  if (!user.length) {
    throw new ApiError(401, "Unable to fetch user watch history");
  }
  return res
    .status(200)
    .json(
      ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History Fetched successfully"
      )
    );
});
