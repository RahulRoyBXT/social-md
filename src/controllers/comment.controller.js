import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

// Todo: Add nested Comment

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Check if video id is valid
  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json(new ApiError(404, "Video not Found"));
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: {
      path: "owner",
      select: "-password -watchHistory -refreshToken",
    },
    sort: { createdAt: -1 },
    lean: true,
  };

  const comments = await Comment
    .paginate({ video: videoId, content: { $ne: null } }, options)

  const paginatedResult = Comment.aggregatePaginate(comments, options);
  res
    .status(200)
    .json(
      new ApiResponse(200, paginatedResult, "Comment Fetched Successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  const comment = await Comment.create({
    content,
    video: new mongoose.Types.ObjectId(videoId),
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment successfully added"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.params;

  const updateComment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: req.user._id },
    { content },
    { new: true }
  );
  if (!updateComment) {
    return res
      .status(404)
      .json(new ApiError(404, "Comment not found or unauthorized"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updateComment, "Comment Updated Successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  const deletedComment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user._id,
  });
  if (!deletedComment) {
    return res
      .status(404)
      .json(new ApiError(404, "Comment not found or unauthorized"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment Deleted Successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
