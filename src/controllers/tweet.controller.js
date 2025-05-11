import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweets.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// TODO: All of these needs ZOD Schema Validations

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  // Tweet
  const tweet = await Tweet.create({
    owner: req.user._id,
    content,
  });

  if (!tweet) {
    throw new ApiError(500, `Tweet can't be created due to server issue`);
  }

  res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  // Getting userId from params
  const { userId } = req.params;

  const tweets = await Tweet.aggregate([
    {
      $match: { owner: mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        "user._id": 1,
        "user.name": 1,
        "user.username": 1,
        "user.email": 1,
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, tweets, "User Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content: newContent } = req.body;

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet is not found");
  }
  const isOwner = tweet.owner.toString() === req.user._id.toString();
  if (!isOwner) {
    throw new ApiError(401, "Unauthorized to modify");
  }

  tweet.content = newContent;

  const updatedTweet = await tweet.save();

  if (!updatedTweet) {
    throw new ApiError(500, "Internal server Error");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet has been updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const {tweetId} = req.params

  const tweet = await Tweet.findById(tweetId)

  if(!tweet){
    throw new ApiError(404, 'Tweet not found')
  }

  const deletedTweet = await Tweet.findByIdAndDelete(
    {_id: tweetId , owner: req.user._id}
)

  if(!deletedTweet){
    throw new ApiError(401, 'Unauthorized access!')
  }

  res.status(200).json(new ApiResponse(200, deletedTweet, 'Tweet has been removed'))
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
