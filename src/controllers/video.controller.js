import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  cloudinaryUploader,
  deleteFile,
} from "../../services/cloudinary.service.js";
import { DeleteLocalFile } from "../utils/DeleteUploadedFileFromLocal.js";

// TODO: Update Video Model by saving public_id provided by cloudinary also save public id for thumbnail

const getAllVideos = asyncHandler(async (req, res) => {
  // Setup: Extract all field from req.query
  // Init: Empty match state
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  // Prepping for match stage
  const matchStage = {};

  // If query exits, add $or (tittle and Desc search)
  if (query) {
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  //If UserId available? filterBy owner
  if (userId && userId.toString() === req.user._id.toString()) {
    matchStage.owner = req.user._id;
  }
  //if UserId is different then isPublished true [Making it only showcase public videos]
  if (!userId || (userId && userId.toString() !== req.user._id.toString())) {
    matchStage.isPublished = true;
  }

  // Sort Stage Prep
  // init Empty sort Stage
  const sortStage = {};
  if (sortBy) {
    sortStage[sortBy] = sortType === "asc" ? 1 : -1;
  }

  // Build Aggregation pipeline with match and sort

  const aggregation = Video.aggregate([
    { $match: matchStage },
    { $sort: sortStage },
    {
      $project: {
        _id: 1,
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        owner: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  // Creating pagination Options

  const paginatedOptions = {
    page: Number(page),
    limit: Number(limit),
  };

  // call aggregatePaginate for Dynamic pagination and sorting

  const PaginatedVideos = await Video.aggregatePaginate(
    aggregation,
    paginatedOptions
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        PaginatedVideos,
        "All videos are fetched successfully"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const urls = req.filePath;

  const { title, description } = req.body;
  const videoResult = await cloudinaryUploader(urls[0]);
  const thumbnailResult = await cloudinaryUploader(urls[1]);

  const newVideo = await Video.create({
    videoFile: videoResult.playback_url,
    thumbnail: thumbnailResult.url,
    title: title || "Not Available",
    description: description || "Not available",
    duration: videoResult.duration,
    isPublished: true,
    owner: req.user._id,
  });

  // console.log(newVideo)
  if (!newVideo) {
    throw new ApiError(
      500,
      "Something Went wrong while saving video info to DB"
    );
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, newVideo, "Video uploaded and saved successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const videoInfo = await Video.findById(videoId);
  res.status(200).json(videoInfo);
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  const { title, description } = req.body;

  const video = await Video.findById(videoId);

  const videoOwner = video.owner;
  const userId = req.user._id;

  // Is owner
  const isOwner = videoOwner.toString() === userId.toString();

  if (!isOwner) {
    throw new ApiError(401, "Not Authorized to update the content!");
  }

  if (!video) {
    throw new ApiError(400, `Couldn't find the video by the ID`);
  }

  const thumbnailLocalPath = req.file.path;
  const videoResult = await cloudinaryUploader(thumbnailLocalPath);

  if (!videoResult) {
    throw new ApiError(500, "Something was wrong while uploading to Cloud");
  }
  const oldThumbnail = video.thumbnail;
  video.thumbnail = videoResult.url;

  if (title) {
    video.title = title;
  }
  if (description) {
    video.description = description;
  }
  await video.save();
  //TODO: delete video
  await deleteFile(oldThumbnail);
  // Responding

  res
    .status(200)
    .json(new ApiResponse(200, video, "Thumbnail Changed successfully"));
});

// We are Assuming this [publicId] field
// Todo: reminder: Add publicId to videoModel
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId).select("publicId owner");

  if (!video) {
    throw new ApiError(404, "Unable to find the video");
  }

  const public_video_id = video.publicId;
  const owner = video.owner;

  // checking for Owner
  const isOwner = owner.toString() === req.user._id.toString();

  if (!isOwner) {
    throw new ApiError(401, "Not Authorized to delete the Video");
  }

  // Delete from DB
  const deleted = await Video.findOneAndDelete(videoId);

  if (!deleted) {
    throw new ApiError(500, "Unable to perform delete action");
  }

  //TODO: delete video
  await deleteFile(public_video_id);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videoId,
        "Video deleted Successfully by this The video ID"
      )
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId).select("isPublished owner");
  if (!video) {
    throw new ApiError(500, "Video is not available");
  }
  const owner = video.owner;
  const publishedStatus = video.isPublished;

  // Complimenting DB's predefined status
  video.isPublished = !publishedStatus;

  const data = await video.save;

  if (!data) {
    throw new ApiError(400, "Internal Error, We could not save that action");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, data, "Successfully saved the Video Publish Status")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
