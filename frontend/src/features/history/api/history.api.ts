import { API, apiClient } from '@/api';
import type { ApiResponse } from '@/types/video.types';
import {
	WatchHistoryListSchema,
	type WatchHistoryVideo,
} from '../types/history.schemas';

export const getWatchHistory = async (): Promise<WatchHistoryVideo[]> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.history.list,
	);
	return WatchHistoryListSchema.parse(data.data);
};

export const addToWatchHistory = async (videoId: string): Promise<void> => {
	await apiClient.patch<ApiResponse<unknown>>(API.history.write, {
		videoId,
	});
};
