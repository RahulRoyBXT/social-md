import mongoose, {Schema} from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Playlist name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    videos: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

},{timestamps: true})

export const playlist = mongoose.model('playlist', playlistSchema)