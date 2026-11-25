import { useEffect, useMemo, useRef } from 'react';
import { UsersThreeIcon } from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { SidebarSignInPrompt } from '@/components/navigation/sidebar/SidebarSignInPrompt';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/auth.store';
import { useSubscriptionsFeed } from '@/features/subscriptions/hooks/useSubscriptionsFeed';
import type { SubscriptionFeedItem } from '@/features/subscriptions/types/subscriptions.schemas';
import { TweetCard } from '@/features/tweets/components/TweetCard';
import { VideoCard } from '@/features/videos/components/VideoCard';
import { VideoCardSkeleton } from '@/features/videos/components/VideoCardSkeleton';

export default function SubscriptionsPage() {
	const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	const {
		data,
		isLoading,
		isError,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		refetch,
	} = useSubscriptionsFeed(isAuthenticated);

	const items = useMemo(() => {
		const seen = new Set<string>();
		const flattened: SubscriptionFeedItem[] = [];
		for (const page of data?.pages ?? []) {
			for (const item of page.items) {
				const key = `${item.feedType}-${item._id}`;
				if (!seen.has(key)) {
					seen.add(key);
					flattened.push(item);
				}
			}
		}
		return flattened;
	}, [data]);

	useEffect(() => {
		const node = sentinelRef.current;
		if (!node || !hasNextPage || isFetchingNextPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					void fetchNextPage();
				}
			},
			{ rootMargin: '200px' },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
				<header className="space-y-1">
					<h1 className="text-2xl font-bold text-foreground">
						Subscriptions
					</h1>
					<p className="text-sm text-muted-foreground">
						Latest videos and tweets from channels you follow.
					</p>
				</header>

				{isAuthLoading || (isAuthenticated && isLoading) ? (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<VideoCardSkeleton key={i} />
						))}
					</div>
				) : !isAuthenticated ? (
					<div className="py-10">
						<SidebarSignInPrompt
							variant="page"
							title="Sign in to view"
							description="Sign in to see the latest videos and tweets from creators you subscribe to."
						/>
					</div>
				) : isError ? (
					<EmptyState
						icon={<UsersThreeIcon size={40} />}
						title="Unable to load subscriptions feed"
						description="Something went wrong while loading your feed."
						action={
							<Button
								onClick={() => void refetch()}
								variant="outline"
								className="rounded-full"
							>
								Try again
							</Button>
						}
					/>
				) : items.length === 0 ? (
					<EmptyState
						icon={<UsersThreeIcon size={40} />}
						title="No subscriptions feed items yet"
						description="Subscribe to creators to see their latest videos and tweets here."
					/>
				) : (
					<>
						<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{items.map((item) =>
								item.feedType === 'video' ? (
									<VideoCard
										key={`video-${item._id}`}
										video={{
											_id: item._id,
											title: item.title,
											thumbnail: item.thumbnail,
											duration: item.duration,
											views: item.views,
											createdAt: item.createdAt,
											owner: item.owner,
										}}
									/>
								) : (
									<TweetCard
										key={`tweet-${item._id}`}
										tweet={{
											_id: item._id,
											content: item.content,
											createdAt: item.createdAt,
											owner: item.owner,
											views: item.views,
											likesCount: item.likesCount,
											commentsCount: item.commentsCount,
											isLiked: item.isLiked,
										}}
									/>
								),
							)}
						</div>

						{hasNextPage && (
							<div
								ref={sentinelRef}
								className="flex justify-center pt-4"
							>
								<Button
									type="button"
									variant="outline"
									onClick={() => void fetchNextPage()}
									disabled={isFetchingNextPage}
									className="rounded-full"
								>
									{isFetchingNextPage ? 'Loading more...' : 'Load more'}
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</ErrorBoundary>
	);
}
