import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { extractHashtags } from "../utils/hashtags.js";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: true,
      index: true,
    },
    videoPublicId: {
      type: String,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    thumbnailPublicId: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
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

videoSchema.pre("save", async function () {
  if (
    this.isNew ||
    this.isModified("title") ||
    this.isModified("description")
  ) {
    this.hashtags = extractHashtags(this.title, this.description);
  }
});

videoSchema.index({ title: "text", description: "text" });
videoSchema.index({ isPublished: 1, createdAt: -1 });
videoSchema.index({ hashtags: 1, isPublished: 1, createdAt: -1 });

videoSchema.plugin(mongooseAggregatePaginate);

export const Video =
  mongoose.models.Video || mongoose.model("Video", videoSchema);
