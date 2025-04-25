import mongoose,{Schema} from "mongoose";

const tweetSchema = new Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner of the tweet is Required']
    },
    content: {
        type: String,
        require: [true, 'Content is Required']
    }

},{timestamps: true})

export const Tweet = mongoose.model('Tweet', tweetSchema)