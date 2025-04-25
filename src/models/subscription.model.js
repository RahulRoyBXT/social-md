import mongoose, {Schema} from "mongoose";

const SubscriptionSchema = new Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,   // Who is Subbing
        ref: "User"
    },
    channel: {
    type: mongoose.Schema.Types.ObjectId, // Subbing to Channel
    ref:"user"
    }
},{timestamps: true})

export const Subscription = mongoose.model('Subscription', SubscriptionSchema)