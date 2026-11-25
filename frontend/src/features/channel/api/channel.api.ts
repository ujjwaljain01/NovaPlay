import { API, apiClient } from '@/api';
import type { ApiResponse } from '@/types/video.types';
import {
	ChannelProfileSchema,
	ChannelVideosResponseSchema,
	type ChannelProfile,
	type ChannelVideosResponse,
} from '../types/channel.schemas';

export interface GetChannelVideosParams {
	limit?: number;
	nextCursor?: string;
}

export const getChannelProfile = async (
	username: string,
): Promise<ChannelProfile> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.channel.profile(username),
	);
	return ChannelProfileSchema.parse(data.data);
};

export const getChannelVideos = async (
	username: string,
	params: GetChannelVideosParams = {},
): Promise<ChannelVideosResponse> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.channel.videos(username),
		{ params },
	);
	return ChannelVideosResponseSchema.parse(data.data);
};
