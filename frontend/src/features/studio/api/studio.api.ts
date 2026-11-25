import { API, apiClient } from '@/api';
import type { ApiResponse } from '@/types/video.types';
import {
	StudioStatsSchema,
	StudioVideoListSchema,
	StudioVideoSchema,
	type StudioStats,
	type StudioVideo,
} from '../types/studio.schemas';

export interface UpdateStudioVideoPayload {
	title?: string;
	description?: string;
	thumbnail?: string;
	thumbnailPublicId?: string;
	isPublished?: boolean;
}

export const getStudioStats = async (): Promise<StudioStats> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.dashboard.stats,
	);
	return StudioStatsSchema.parse(data.data);
};

export const getMyVideos = async (): Promise<StudioVideo[]> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.videos.myVideos,
	);
	return StudioVideoListSchema.parse(data.data);
};

export const updateStudioVideo = async (
	videoId: string,
	payload: UpdateStudioVideoPayload,
): Promise<StudioVideo> => {
	const { data } = await apiClient.patch<ApiResponse<unknown>>(
		API.videos.byId(videoId),
		payload,
	);
	return StudioVideoSchema.parse(data.data);
};

export const deleteStudioVideo = async (videoId: string): Promise<void> => {
	await apiClient.delete<ApiResponse<unknown>>(API.videos.byId(videoId));
};
