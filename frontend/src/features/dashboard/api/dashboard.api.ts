import { API, apiClient } from '@/api';
import type { ApiResponse } from '@/types/video.types';
import {
	DashboardStatsSchema,
	DashboardVideosResponseSchema,
	type DashboardStats,
	type DashboardVideosResponse,
} from '../types/dashboard.schemas';

export interface GetDashboardVideosParams {
	page?: number;
	limit?: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.dashboard.stats,
	);
	return DashboardStatsSchema.parse(data.data);
};

export const getDashboardVideos = async (
	params: GetDashboardVideosParams = {},
): Promise<DashboardVideosResponse> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.dashboard.videos,
		{ params },
	);
	return DashboardVideosResponseSchema.parse(data.data);
};
