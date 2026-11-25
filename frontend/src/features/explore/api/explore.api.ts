import { API, apiClient } from '@/api';
import {
	ExploreFeedResponseSchema,
	type ExploreCategory,
	type ExploreContentType,
	type ExploreFeedResponse,
} from '../types/explore.schemas';

export interface GetExploreFeedParams {
	category: ExploreCategory;
	type?: ExploreContentType;
	page?: number;
	limit?: number;
}

export const getExploreFeed = async ({
	category,
	type = 'all',
	page = 1,
	limit = 12,
}: GetExploreFeedParams): Promise<ExploreFeedResponse> => {
	const { data } = await apiClient.get<{ success: boolean; data: unknown }>(
		API.explore.byCategory(category),
		{
			params: { type, page, limit },
		},
	);
	return ExploreFeedResponseSchema.parse(data.data);
};
