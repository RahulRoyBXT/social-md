import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

//TODO: Nested Comment

const commentSchema = new Schema({
    content: {
        type: String,
        require: [true, 'Message is Required']
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{timestamps: true})

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model('Comment', commentSchema)