import type {
	ExploreCategory,
	ExploreContentType,
} from '../types/explore.schemas';

export const exploreQueryKeys = {
	all: ['explore'] as const,
	feed: (category: ExploreCategory, type: ExploreContentType) =>
		[...exploreQueryKeys.all, category, type] as const,
};
