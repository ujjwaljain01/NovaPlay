import { API, apiClient } from '@/api';
import type { ApiResponse } from '@/types/video.types';
import { LikedVideosListSchema, type LikedVideo } from '../types/liked.schemas';

export const getLikedVideos = async (): Promise<LikedVideo[]> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(API.liked.list);
	return LikedVideosListSchema.parse(data.data);
};
