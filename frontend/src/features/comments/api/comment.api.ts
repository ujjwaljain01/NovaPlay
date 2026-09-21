import { apiClient } from '@/api';
import type { ApiResponse } from '@/types/video.types';
import type { Comment, GetCommentsResponse } from '../types/comment.types';

export const getComments = async (targetId: string, params: { limit?: number; cursor?: string } = {}) => {
	const { data } = await apiClient.get<ApiResponse<GetCommentsResponse>>(
		`/comments/${targetId}`,
		{ params }
	);
	return data.data;
};

export const addComment = async (targetId: string, content: string) => {
	const { data } = await apiClient.post<ApiResponse<Comment>>(
		`/comments/${targetId}`,
		{ content }
	);
	return data.data;
};

export const deleteComment = async (commentId: string) => {
	const { data } = await apiClient.delete<ApiResponse<null>>(
		`/comments/c/${commentId}`
	);
	return data.data;
};
