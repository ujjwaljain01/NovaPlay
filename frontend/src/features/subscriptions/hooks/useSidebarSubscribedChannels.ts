import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getSubscribedChannelsPage } from '../api/subscriptions.api';
import { subscriptionsQueryKeys } from '../queries/subscriptions.query-keys';
import type { SubscribedChannelItem } from '../types/subscriptions.schemas';

const INITIAL_LIMIT = 4;
const EXPAND_LIMIT = 10;

export function useSidebarSubscribedChannels(enabled: boolean) {
	const [isExpanded, setIsExpanded] = useState(false);

	const query = useInfiniteQuery({
		queryKey: subscriptionsQueryKeys.channels(),
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			getSubscribedChannelsPage({
				offset: pageParam,
				limit: pageParam === 0 ? INITIAL_LIMIT : EXPAND_LIMIT,
			}),
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((sum, page) => sum + page.channels.length, 0);
		},
		enabled,
		staleTime: 1000 * 60 * 5,
	});

	const allChannels = useMemo(() => {
		const seen = new Set<string>();
		const deduped: SubscribedChannelItem[] = [];
		for (const page of query.data?.pages ?? []) {
			for (const channel of page.channels) {
				if (!seen.has(channel._id)) {
					seen.add(channel._id);
					deduped.push(channel);
				}
			}
		}
		return deduped;
	}, [query.data]);

	const totalCount = query.data?.pages[0]?.totalCount ?? 0;

	const visibleChannels = isExpanded
		? allChannels
		: allChannels.slice(0, INITIAL_LIMIT);

	const canShowMore =
		totalCount > INITIAL_LIMIT &&
		(!isExpanded
			? allChannels.length > INITIAL_LIMIT || Boolean(query.hasNextPage)
			: Boolean(query.hasNextPage));

	const canShowLess = isExpanded && visibleChannels.length > INITIAL_LIMIT;

	const showMore = async () => {
		if (!isExpanded && allChannels.length > INITIAL_LIMIT) {
			setIsExpanded(true);
			return;
		}
		setIsExpanded(true);
		if (query.hasNextPage) {
			await query.fetchNextPage();
		}
	};

	const showLess = () => {
		setIsExpanded(false);
	};

	return {
		channels: visibleChannels,
		totalCount,
		isExpanded,
		isLoading: query.isLoading,
		isFetchingNextPage: query.isFetchingNextPage,
		isError: query.isError,
		canShowMore,
		canShowLess,
		showMore,
		showLess,
	};
}
