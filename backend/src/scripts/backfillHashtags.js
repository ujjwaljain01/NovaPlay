import mongoose from "mongoose";
import connectDB from "../db/index.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { extractHashtags } from "../utils/hashtags.js";

const BATCH_SIZE = 500;

function arraysEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

async function backfillCollection(Model, getTexts, label) {
  let processed = 0;
  let updated = 0;
  let ops = [];

  const cursor = Model.find({}, { _id: 1, title: 1, description: 1, content: 1, hashtags: 1 })
    .lean()
    .cursor();

  for await (const doc of cursor) {
    processed += 1;
    const nextTags = extractHashtags(...getTexts(doc));
    const currentTags = Array.isArray(doc.hashtags) ? doc.hashtags : [];

    if (!arraysEqual(currentTags, nextTags)) {
      ops.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { hashtags: nextTags } },
        },
      });
    }

    if (ops.length >= BATCH_SIZE) {
      await Model.bulkWrite(ops, { ordered: false });
      updated += ops.length;
      ops = [];
    }
  }

  if (ops.length > 0) {
    await Model.bulkWrite(ops, { ordered: false });
    updated += ops.length;
  }

  console.log(`[backfillHashtags] ${label}: scanned=${processed}, updated=${updated}`);
}

async function main() {
  await connectDB();

  try {
    await backfillCollection(
      Video,
      (doc) => [doc.title, doc.description],
      "videos"
    );
    await backfillCollection(
      Tweet,
      (doc) => [doc.content],
      "tweets"
    );
  } finally {
    await mongoose.connection.close();
  }
}

main().catch((error) => {
  console.error("[backfillHashtags] Failed:", error);
  process.exit(1);
});
