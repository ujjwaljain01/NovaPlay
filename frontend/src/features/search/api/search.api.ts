import { API, apiClient } from '@/api';
import {
	SearchResponseSchema,
	type SearchDate,
	type SearchResponse,
	type SearchType,
} from '../types/search.schemas';

export interface SearchContentParams {
	q: string;
	tag?: string;
	type?: SearchType;
	date?: SearchDate;
	page?: number;
	limit?: number;
}

export const searchContent = async (
	params: SearchContentParams,
): Promise<SearchResponse> => {
	const { data } = await apiClient.get<{ success: boolean; data: unknown }>(
		API.search.query,
		{ params },
	);
	return SearchResponseSchema.parse(data.data);
};
