import { API, apiClient } from '@/api';
import type { ApiResponse } from '@/types/video.types';
import {
	SubscribedChannelsPageSchema,
	SubscriptionFeedResponseSchema,
	SubscriptionListSchema,
	ToggleSubscriptionResponseSchema,
	type SubscribedChannelsPage,
	type SubscriptionChannel,
	type SubscriptionFeedResponse,
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

export const getSubscribedChannelsPage = async ({
	offset = 0,
	limit = 4,
}: {
	offset?: number;
	limit?: number;
} = {}): Promise<SubscribedChannelsPage> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.subscriptions.channels,
		{
			params: { offset, limit },
		},
	);
	return SubscribedChannelsPageSchema.parse(data.data);
};

export const getSubscriptionsFeed = async ({
	offset = 0,
	limit = 20,
}: {
	offset?: number;
	limit?: number;
} = {}): Promise<SubscriptionFeedResponse> => {
	const { data } = await apiClient.get<ApiResponse<unknown>>(
		API.subscriptions.feed,
		{
			params: { offset, limit },
		},
	);
	return SubscriptionFeedResponseSchema.parse(data.data);
};

export const toggleSubscription = async (
	channelId: string,
): Promise<ToggleSubscriptionResponse> => {
	const { data } = await apiClient.post<ApiResponse<unknown>>(
		API.subscriptions.toggle(channelId),
	);
	return ToggleSubscriptionResponseSchema.parse(data.data);
};
