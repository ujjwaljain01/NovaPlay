import { API, apiClient } from '@/api';
import type { ApiResponse } from '@/types/video.types';
import {
	EnrichedCommentRepliesResponseSchema,
	EnrichedCommentSchema,
	EnrichedCommentsResponseSchema,
	type EnrichedComment,
	type EnrichedCommentRepliesResponse,
	type EnrichedCommentsResponse,
} from '../types/comment.schemas';

export const getComments = async (
	targetId: string,
	params: { limit?: number; cursor?: string } = {},
): Promise<EnrichedCommentsResponse> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.comments.forTarget(targetId),
		{ params },
	);
	return EnrichedCommentsResponseSchema.parse(data.data);
};

export const addComment = async (
	targetId: string,
	content: string,
): Promise<EnrichedComment> => {
	const { data } = await apiClient.post<ApiResponse<unknown>>(
		API.comments.forTarget(targetId),
		{ content },
	);
	return EnrichedCommentSchema.parse(data.data);
};

export const updateComment = async (
	commentId: string,
	content: string,
): Promise<EnrichedComment> => {
	const { data } = await apiClient.patch<ApiResponse<unknown>>(
		API.comments.byId(commentId),
		{ content },
	);
	return EnrichedCommentSchema.parse(data.data);
};

export const deleteComment = async (commentId: string): Promise<void> => {
	await apiClient.delete<ApiResponse<unknown>>(
		API.comments.byId(commentId),
	);
};

export const getCommentReplies = async (
	commentId: string,
	params: { limit?: number; cursor?: string } = {},
): Promise<EnrichedCommentRepliesResponse> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.comments.replies(commentId),
		{ params },
	);
	return EnrichedCommentRepliesResponseSchema.parse(data.data);
};

export const toggleCommentLike = async (commentId: string) => {
	const { data } = await apiClient.post<ApiResponse<unknown>>(
		`/likes/toggle/c/${commentId}`,
	);
	return data.data;
};
