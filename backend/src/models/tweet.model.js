import mongoose, { Schema } from "mongoose";
import { extractHashtags } from "../utils/hashtags.js";

const tweetSchema = new Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Tweet content is required"],
      validate: {
        validator: function (value) {
          return [...value].length <= 320;
        },
        message:
          "Database Error: Tweet content cannot exceed 320 visual characters.",
      },
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

tweetSchema.pre("save", async function () {
  if (this.isNew || this.isModified("content")) {
    this.hashtags = extractHashtags(this.content);
  }
});

tweetSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() || {};
  const nextContent = update.$set?.content ?? update.content;
  if (typeof nextContent === "string") {
    const tags = extractHashtags(nextContent);
    if (update.$set) {
      update.$set.hashtags = tags;
    } else {
      update.hashtags = tags;
    }
    this.setUpdate(update);
  }
});

tweetSchema.index({ owner: 1, createdAt: -1 });
tweetSchema.index({ hashtags: 1, createdAt: -1 });
tweetSchema.index({ createdAt: -1 });
tweetSchema.index({ content: "text" });

export const Tweet =
  mongoose.models.Tweet || mongoose.model("Tweet", tweetSchema);
