import { API, apiClient } from '@/api';
import type { ApiResponse } from '@/types/video.types';
import {
	SubscriptionListSchema,
	ToggleSubscriptionResponseSchema,
	type SubscriptionChannel,
	type ToggleSubscriptionResponse,
} from '../types/subscriptions.schemas';

export const getUserSubscriptions = async (
	channelId: string,
): Promise<SubscriptionChannel[]> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.subscriptions.list(channelId),
	);
	return SubscriptionListSchema.parse(data.data);
};

export const toggleSubscription = async (
	channelId: string,
): Promise<ToggleSubscriptionResponse> => {
	const { data } = await apiClient.post<ApiResponse<unknown>>(
		API.subscriptions.toggle(channelId),
	);
	return ToggleSubscriptionResponseSchema.parse(data.data);
};
