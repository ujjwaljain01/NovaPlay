import mongoose, { Schema } from "mongoose";

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
  },
  { timestamps: true }
);

tweetSchema.index({ owner: 1, createdAt: -1 });
tweetSchema.index({ content: "text" });

export const Tweet = new mongoose.model("Tweet", tweetSchema);
