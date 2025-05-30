
import mongoose, { Schema, Types } from "mongoose";

const likeSchema = new Schema(
  {
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

likeSchema.pre("validate", function (next) {
  if (!this.comment && !this.video && !this.tweet) {
    this.invalidate(
      "content",
      "A like must reference either a comment, video, or tweet"
    );
  }
  next();
});


likeSchema.index(
  {
    likedBy: 1,
    video: 1,
    comment: 1,
    tweet: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      $or: [
        { video: { $exists: true } },
        { comment: { $exists: true } },
        { tweet: { $exists: true } },
      ],
    },
  }
);

export const Like = mongoose.model("Like", likeSchema);
