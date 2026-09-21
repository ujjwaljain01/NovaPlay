import type { Tweet } from '../types/tweet.types';
import { TweetCard } from './TweetCard';
import { TweetCardSkeleton } from './TweetCardSkeleton';

interface TweetFeedProps {
	tweets: Tweet[];
	isLoading?: boolean;
	skeletonCount?: number;
	emptyMessage?: string;
}

export function TweetFeed({
	tweets,
	isLoading = false,
	skeletonCount = 6,
	emptyMessage = 'No tweets yet. Be the first to share!',
}: TweetFeedProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: skeletonCount }).map((_, i) => (
					<TweetCardSkeleton key={i} />
				))}
			</div>
		);
	}

	if (!tweets || tweets.length === 0) {
		return (
			<div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
				<p className="text-sm font-medium text-muted-foreground">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{tweets.map((tweet) => (
				<TweetCard key={tweet._id} tweet={tweet} />
			))}
		</div>
	);
}
