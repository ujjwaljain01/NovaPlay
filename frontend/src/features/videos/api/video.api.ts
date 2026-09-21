// src/features/videos/api/video.api.ts

import { apiClient } from '@/api';

import type {
	ApiResponse,
	GetVideosResponse,
	Video,
} from '@/types/video.types';

export interface GetVideosParams {
	page?: number;

	limit?: number;

	query?: string;

	sortBy?: string;

	sortType?: 'asc' | 'desc';

	userId?: string;
}

export const getVideos = async (params: GetVideosParams = {}) => {
	const { data } = await apiClient.get<ApiResponse<GetVideosResponse>>(
		'/videos',
		{
			params,
		},
	);

	return data.data;
};

export const getVideo = async (videoId: string) => {
	const { data } = await apiClient.get<ApiResponse<Video>>(
		`/videos/${videoId}`,
	);

	return data.data;
};

export const incrementVideoViews = async (videoId: string) => {
	const { data } = await apiClient.patch<ApiResponse<Video>>(
		`/videos/${videoId}/increment-views`,
	);

	return data.data;
};

export const publishVideo = async (formData: FormData) => {
	const { data } = await apiClient.post<ApiResponse<Video>>(
		'/videos',
		formData,
		{
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		},
	);

	return data.data;
};

export const deleteVideo = async (videoId: string) => {
	const { data } = await apiClient.delete<ApiResponse<null>>(
		`/videos/${videoId}`,
	);

	return data.data;
};

export const toggleVideoLike = async (videoId: string) => {
	const { data } = await apiClient.post<ApiResponse<any>>(
		`/likes/toggle/v/${videoId}`,
	);

	return data.data;
};

export const getLikedVideos = async () => {
	const { data } = await apiClient.get<ApiResponse<Video[]>>(
		'/likes/videos',
	);

	return data.data;
};
