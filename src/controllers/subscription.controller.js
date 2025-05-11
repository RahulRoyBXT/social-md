import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // Self subbing is not allowed

  const isOwner = channelId.toString() === req.use._id.toString();

  if (isOwner) {
    throw new ApiError(400, "Self subbing is not allowed");
  }

  // From here on out not the owner

  // Find the channel
  const channel = await User.findById(channelId );

  // If channel not available
  if (!channel) {
    throw new ApiError(404, "Invalid channel Id");
  }

  // channelId this is actually user id
  //checking: is subscribed

  const subModel = await Subscription.findOne({
    channel: channelId,
    subsScriber: req.user._id,
  });

  if (subModel) {
    await Subscription.findByIdAndDelete({ _id: subModel._id });
  } else {
    const newSub = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });
  }

  if (newSub) {
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Toggle action performed successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // Check for Valid Channel 
  const channel = User.findById(channelId)

  if(!channel){
    throw new ApiError(404, 'Not a Valid Channel Id')
  }

  // All Subscribe of the channel
  const Subs = Subscription.aggregate([
    {
      $match: {channel: channelId}
    },
    {
      $lookup: {
        from: 'users',
        localField: 'subscriber',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              username: 1,
              email: 1,
              fullName: 1,
              avatar: 1,
              coverImage:1,
            }
          }
        ]
      }
    },
  ])
  if(!Subs){
    res.status(200).json( new ApiResponse(200, Subs, 'Channel has no subscriber'))
  }
  res.status(200).json(new ApiResponse(200, Subs, 'Subscriber Fetched Successfully'))
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  // Is a valid User?
  const isValidUser = await User.findById(subscriberId)

  if(!isValidUser){
    return res.status(404).json(new ApiError(404, 'User Does not exits'))
  }

  // All Subbed Channel

  const SubbedChannels = await Subscription.aggregate([
    {
      $match: {subscriber: subscriberId}
    },
    {
      $lookup: {
        from: 'users',
        localField: 'channel',
        foreignField:'_id',
        pipeline: [
          {
            $project: {
              username: 1,
              email: 1,
              fullName: 1,
              avatar: 1,
              coverImage:1,
            }
          }
        ],
        as: 'channelData'
      }
    },
    {
      $unwind: '$channelData'
    },
    // This Replace The Root
    // { $replaceRoot: { newRoot: '$channelData' } } 
  ]) 
  if(SubbedChannels.length === 0){
    return res.status(200).json(new ApiResponse(200, [], 'No subbed channel available'))
  }

  res.status(200).json(new ApiResponse(200, SubbedChannels, 'Subbed Channel Has been successfully fetched'))
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
