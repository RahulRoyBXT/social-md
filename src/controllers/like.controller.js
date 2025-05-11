import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from '../models/video.model.js'
import { Comment } from "../models/comments.model.js"
import { Tweet } from "../models/tweets.model.js"
import { pipeline } from "zod"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    
    // Check if video exists
    const video = await Video.findById(videoId)
    
    if(!video){
        throw new ApiError(404, 'video not found')
    }
    const userId  = req.user._id

    // Check if like already exists
    const existingLike = await Like.findOne({video: videoId, likedBy: userId})
    
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(200, {}, 'Video Action Success'))

    }
    const like = await Like.create({
        video: videoId,
        likedBy: userId
    })

    return res.status(200).json(new ApiResponse(200, like, 'Video Action Success'))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
     // Check if comment exists
    const comment = await Comment.findById(commentId)
    
    if(!comment){
        throw new ApiError(404, 'video not found')
    }
    const userId  = req.user._id

    // Check if like already exists
    const existingLike = await Like.findOne({comment: commentId, likedBy: userId})
    
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(200, {}, 'Comment Action Success'))

    }
    const like = await Like.create({
        comment: commentId,
        likedBy: userId
    })

    return res.status(201).json(new ApiResponse(201, like, 'Comment Action Success'))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const tweet = await Tweet.findById(tweetId)
    
    if(!tweet){
        throw new ApiError(404, 'video not found')
    }
    const userId  = req.user._id

    // Check if like already exists
    const existingLike = await Like.findOne({tweet: tweetId, likedBy: userId})
    
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(200, {}, 'Tweet Action Success'))

    }
    const like = await Like.create({
        tweet: tweetId,
        likedBy: userId
    })

    return res.status(201).json(new ApiResponse(201, like, 'Tweet Action Success'))
}
)

// all liked videos of loggedIn Users
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const likes = await Like.find({likedBy:userId, videos: {$ne: null}})
    .populate("video") // Pulling full video docs
    .lean()

//     const likedVideos = await Like.aggregate([
//   {
//     $match: {
//       likedBy: new mongoose.Types.ObjectId(userId),
//       video: { $ne: null }
//     }
//   },
//   {
//     $lookup: {
//       from: "videos",
//       localField: "video",
//       foreignField: "_id",
//       as: "videoDetails"
//     }
//   },
//   { $unwind: "$videoDetails" },
//   { $replaceRoot: { newRoot: "$videoDetails" } }
//     ]);
    
    if(!likes || likes.length() === 0){
        return res.status(200).json(new ApiResponse(200, [], `No liked video found`))
    }

    const videos = likes.map(like => like.video)

    return res.status(200).json(new ApiResponse(200, videos, 'Liked videos fetched successfully'))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}