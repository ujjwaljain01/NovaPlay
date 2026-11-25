import mongoose, { Schema } from "mongoose";

const tweetViewLogSchema = new Schema({
  tweetId: {
    type: Schema.Types.ObjectId,
    ref: "Tweet",
    required: true,
  },
  viewerKey: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

tweetViewLogSchema.index({ tweetId: 1, viewerKey: 1 }, { unique: true });
tweetViewLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export const TweetViewLog =
  mongoose.models.TweetViewLog ||
  mongoose.model("TweetViewLog", tweetViewLogSchema);
