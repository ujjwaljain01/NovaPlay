import { ChatTextIcon } from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { TweetFeed } from '@/features/tweets/components/TweetFeed';
import { useTweets } from '@/features/tweets/hooks/useTweets';

export default function TweetsPage() {
	const { data, isLoading, isError } = useTweets({ limit: 20 });
	const tweets = data?.docs ?? [];

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
				<header className="space-y-1">
					<h1 className="text-2xl font-bold text-foreground">Tweets</h1>
					<p className="text-sm text-muted-foreground">
						Latest thoughts and updates from creators.
					</p>
				</header>

				{isError ? (
					<EmptyState
						icon={<ChatTextIcon size={40} />}
						title="Unable to load tweets"
						description="Please try again in a moment."
					/>
				) : (
					<TweetFeed
						tweets={tweets}
						isLoading={isLoading}
						skeletonCount={6}
						emptyMessage="No tweets found."
					/>
				)}
			</div>
		</ErrorBoundary>
	);
}
