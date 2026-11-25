import { useInfiniteQuery } from '@tanstack/react-query';
import { getExploreFeed } from '../api/explore.api';
import { exploreQueryKeys } from '../queries/explore.query-keys';
import type {
	ExploreCategory,
	ExploreContentType,
} from '../types/explore.schemas';

const EXPLORE_PAGE_LIMIT = 12;

export function useExploreFeed(
	category: ExploreCategory | null,
	type: ExploreContentType,
) {
	return useInfiniteQuery({
		queryKey: exploreQueryKeys.feed(category ?? 'trending', type),
		queryFn: ({ pageParam }) =>
			getExploreFeed({
				category: category ?? 'trending',
				type,
				page: pageParam,
				limit: EXPLORE_PAGE_LIMIT,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.hasNextPage ? lastPage.page + 1 : undefined,
		enabled: Boolean(category),
		staleTime: 1000 * 60 * 2,
	});
}
