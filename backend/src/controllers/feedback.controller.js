import { Feedback } from "../models/feedback.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const ALLOWED_CATEGORIES = new Set(["bug", "feature", "general"]);
const MAX_MESSAGE_LENGTH = 2000;
const MAX_PAGE_URL_LENGTH = 500;

export const submitFeedback = asyncHandler(async (req, res) => {
  const { category, message, pageUrl } = req.body ?? {};

  if (typeof category !== "string" || !ALLOWED_CATEGORIES.has(category.trim())) {
    throw new ApiError(
      400,
      "Invalid feedback category. Must be one of: bug, feature, general."
    );
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    throw new ApiError(400, "Feedback message is required.");
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new ApiError(
      400,
      `Feedback message must be ${MAX_MESSAGE_LENGTH} characters or less.`
    );
  }

  let normalizedPageUrl;
  if (pageUrl !== undefined && pageUrl !== null) {
    if (typeof pageUrl !== "string") {
      throw new ApiError(400, "Invalid pageUrl.");
    }
    const trimmedPageUrl = pageUrl.trim();
    if (trimmedPageUrl.length > MAX_PAGE_URL_LENGTH) {
      throw new ApiError(
        400,
        `pageUrl must be ${MAX_PAGE_URL_LENGTH} characters or less.`
      );
    }
    if (trimmedPageUrl.length > 0) {
      normalizedPageUrl = trimmedPageUrl;
    }
  }

  const feedback = await Feedback.create({
    user: req.user?._id ?? null,
    category: category.trim(),
    message: trimmedMessage,
    ...(normalizedPageUrl ? { pageUrl: normalizedPageUrl } : {}),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, feedback, "Feedback submitted successfully"));
});
