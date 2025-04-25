import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { cloudinaryUploader } from "../../services/cloudinary.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";

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

  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  let coveImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coveImageLocalPath = req.files?.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    if (coveImageLocalPath) {
      fs.unlink(coveImageLocalPath, (err) => {
        if (err) throw err;
        console.log("deleted");
      });
    }
    throw new ApiError(400, "Avatar file is required");
  }

  if (
    [email, fullName, username, password].some((field) => field?.trim() === "")
  ) {
    fs.unlink(coveImageLocalPath, (err) => {
      if (err) throw err;
      console.log("deleted");
    });
    fs.unlink(avatarLocalPath, (err) => {
      if (err) throw err;
      console.log("deleted");
    });
    throw new ApiError(400, "All fields are required");
  }
  if (!email?.includes("@")) {
    fs.unlink(coveImageLocalPath, (err) => {
      if (err) throw err;
      console.log("deleted");
    });
    fs.unlink(avatarLocalPath, (err) => {
      if (err) throw err;
      console.log("deleted");
    });
    throw new ApiError(400, "Email was not valid");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    fs.unlink(coveImageLocalPath, (err) => {
      if (err) throw err;
      console.log("deleted");
    });
    fs.unlink(avatarLocalPath, (err) => {
      if (err) throw err;
      console.log("deleted");
    });
    throw new ApiError(409, "User with email or username is already exists");
  }

  const avatar = await cloudinaryUploader(avatarLocalPath);
  const coverImage = await cloudinaryUploader(coveImageLocalPath);

  if (!avatar) {
    fs.unlink(coveImageLocalPath, (err) => {
      if (err) throw err;
      console.log("deleted");
    });
    fs.unlink(avatarLocalPath, (err) => {
      if (err) throw err;
      console.log("deleted");
    });
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username,
  });

  console.log("DB:", user);

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

export const refreshAccessToken = asyncHandler( async (req, res)=> {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
    if(!incomingRefreshToken){
      throw new ApiError(401, 'Unauthorize access')
    }
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken._id)
    if(!user){
      throw new ApiError(401, 'Invalid Token')
    }
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, 'Refreshed token is expired or used')
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
    const {accessToken, newRefreshToken}= await generateAccessAndRefreshTokens(user._id)
  
    return res.status(200)
    .cookie('accessToken', accessToken,options)
    .cookie('refreshToken', newRefreshToken, options)
    .json(
      new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, 'Access Token Refreshed')
    )
  } catch (error) {
    throw new ApiError(500, error.message || 'Invalid refresh token')
  }
})