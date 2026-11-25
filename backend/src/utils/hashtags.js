const HASHTAG_REGEX = /(?:^|[\s(])#([a-zA-Z0-9_]{1,50})/g;

export const EXPLORE_CATEGORY_TAGS = {
  gaming: [
    "gaming",
    "games",
    "esports",
    "fps",
    "rpg",
    "gameplay",
    "stream",
    "streamer",
  ],
  sports: [
    "sports",
    "football",
    "soccer",
    "cricket",
    "basketball",
    "nba",
    "f1",
    "fitness",
  ],
  music: [
    "music",
    "song",
    "songs",
    "concert",
    "lofi",
    "hiphop",
    "rock",
    "pop",
    "beats",
  ],
  news: [
    "news",
    "breaking",
    "world",
    "technews",
    "politics",
    "updates",
    "headlines",
  ],
};

export const VALID_EXPLORE_CATEGORIES = [
  "trending",
  ...Object.keys(EXPLORE_CATEGORY_TAGS),
];

export function normalizeTag(raw) {
  if (typeof raw !== "string") return "";
  return raw.trim().replace(/^#+/, "").toLowerCase();
}

export function extractHashtags(...texts) {
  const combined = texts
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .join(" ");

  if (!combined) return [];

  const tags = new Set();
  HASHTAG_REGEX.lastIndex = 0;

  let match;
  while ((match = HASHTAG_REGEX.exec(combined)) !== null) {
    const tag = match[1].toLowerCase();
    if (tag) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}
