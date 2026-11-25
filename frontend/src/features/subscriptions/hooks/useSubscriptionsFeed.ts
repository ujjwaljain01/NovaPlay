import { useInfiniteQuery } from '@tanstack/react-query';
import { getSubscriptionsFeed } from '../api/subscriptions.api';
import { subscriptionsQueryKeys } from '../queries/subscriptions.query-keys';

const FEED_PAGE_SIZE = 20;

export function useSubscriptionsFeed(enabled: boolean) {
	return useInfiniteQuery({
		queryKey: subscriptionsQueryKeys.feed(),
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			getSubscriptionsFeed({
				offset: pageParam,
				limit: FEED_PAGE_SIZE,
			}),
		getNextPageParam: (lastPage) =>
			lastPage.hasMore ? (lastPage.nextOffset ?? undefined) : undefined,
		enabled,
		staleTime: 1000 * 60 * 2,
	});
}
