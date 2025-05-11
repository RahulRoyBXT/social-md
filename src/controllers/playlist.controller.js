import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //create a new playlist

  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, newPlaylist, "New playlist is created Successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  //checking for valid user
  const isValidUser = await User.findById(userId);
  if (!isValidUser) {
    throw new ApiError(404, "User is not found!");
  }

  const playLists = await Playlist.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "videos",
        let: { videoIds: "$videos" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$_id", "$$videoIds"] },
                  { $eq: ["$isPublished", true] },
                ],
              },
            },
          },
          {
            $lookup: "users",
            localField: "owner",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  username: 1,
                  email: 1,
                  fullName: 1,
                  avatar: 1,
                  coverImage: 1,
                },
              },
            ],
            as: "ownerDetails",
          },
          {
            $unwind: {
              path: "$ownerDetails",
              preserveNullAndEmptyArrays: true,
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
              ownerDetails: 1,
            },
          },
        ],
        as: "filteredPlaylist",
      },
    },
    {
      $unwind: {
        path: "$filteredPlaylist",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  // If playlist has not found
  if (!playLists) {
    res.status(404).json(new ApiResponse(404, {}, "No playlist found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, playLists, "Playlist successfully fetched"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // Searching for playlist

  const playlist = await Playlist.findById(playlistId).populate({
    path: "videos",
    match: { isPublished: true },
    populate: {
      path: "owner",
      model: "User",
      select: "username email fullName avatar coverImage",
    },
  });

  // Not Available
  if (!playlist) {
    throw new ApiError(404, "Not Found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(400, playlist, "Playlist has been fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  // is valid video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Not a valid Video");
  }

  // Update the playlist by adding new videos
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: {videos: videoId} },
    { new: true }
  ).select("_id");

   if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }

  res
    .status(202)
    .json(
      new ApiResponse(
        202,
        updatedPlaylist,
        "Video added successfully to successfully to Playlist"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  // check valid video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }
  const removeVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId }, // Removing Video
    },
    { new: true }
  ) // Returning Updated Doc
    .populate({
      path: "videos",
      match: { isPublished: true },
      populate: {
        path: "owner",
        model: "User",
        select: "username email fullname avatar coverImage",
      },
    });

  if (!removeVideo) {
    throw new ApiError(404, "Playlist not found");
  }

  res.status(200).json(new ApiResponse(200, removeVideo,'Video removed from playlist'));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  
  // is valid playlist

  const playlist = await Playlist.findById(playlistId)

  // Verify the Ownership
  if(playlist.owner.toString() !== req.user._id.toString()){
    throw new ApiError(401, 'Unauthorized access')
  }
  const deletedPlaylist = await Playlist.findOneAndDelete({_id: playlistId})

  res.status(200).json(new ApiResponse(200, deletedPlaylist, 'Playlist has been deleted successfully'))

});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  
  // Check Playlist Validity
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
        name,
        description
    },
    {new: true}
    )
    if(!updatedPlaylist){
        throw new ApiError(404, 'Invalid Playlist')
    }
    res.status(200).json(new ApiResponse(200, updatedPlaylist, 'Playlist Updated successfully'))
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
