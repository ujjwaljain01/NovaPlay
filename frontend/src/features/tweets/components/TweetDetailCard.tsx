import { format } from 'date-fns';
import { HashtagText } from '@/components/common/HashtagText';
import { Skeleton } from '@/components/ui/skeleton';
import { formatViews } from '@/lib/format-views';
import { useTweetViewTracker } from '../hooks/useTweetViewTracker';
import type { Tweet } from '../types/tweet.types';
import { TweetActions } from './TweetActions';
import { TweetHeader } from './TweetHeader';

interface TweetDetailCardProps {
	tweet: Tweet;
	onCommentClick?: () => void;
}

function formatFullTimestamp(value: string): string | null {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return format(date, 'h:mm a · MMM d, yyyy');
}

export function TweetDetailCard({
	tweet,
	onCommentClick,
}: TweetDetailCardProps) {
	const fullTimestamp = formatFullTimestamp(tweet.createdAt);
	const likesCount = tweet.likesCount ?? 0;
	const commentsCount = tweet.commentsCount ?? 0;
	const { ref: viewTrackerRef, displayViews } = useTweetViewTracker({
		tweetId: tweet._id,
		initialViews: tweet.views ?? 0,
	});

	return (
		<article
			ref={viewTrackerRef}
			className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
		>
			<TweetHeader owner={tweet.owner} createdAt={tweet.createdAt} />

			<p className="mt-2 whitespace-pre-line break-words text-base leading-relaxed text-[var(--foreground)] sm:text-[17px]">
				<HashtagText text={tweet.content} />
			</p>

			<div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
				{fullTimestamp ? <span>{fullTimestamp}</span> : null}
				<span>
					<strong className="font-semibold text-[var(--foreground)]">
						{formatViews(displayViews)}
					</strong>{' '}
					{displayViews === 1 ? 'View' : 'Views'}
				</span>
				<span>
					<strong className="font-semibold text-[var(--foreground)]">
						{likesCount}
					</strong>{' '}
					{likesCount === 1 ? 'Like' : 'Likes'}
				</span>
				<span>
					<strong className="font-semibold text-[var(--foreground)]">
						{commentsCount}
					</strong>{' '}
					{commentsCount === 1 ? 'Comment' : 'Comments'}
				</span>
			</div>

			<TweetActions
				tweet={tweet}
				views={displayViews}
				onCommentClick={onCommentClick}
			/>
		</article>
	);
}

export function TweetDetailCardSkeleton() {
	return (
		<div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Skeleton className="h-10 w-10 rounded-full" />
					<div className="space-y-1.5">
						<Skeleton className="h-4 w-32 rounded" />
						<Skeleton className="h-3 w-20 rounded" />
					</div>
				</div>
				<Skeleton className="h-3 w-14 rounded" />
			</div>

			<div className="space-y-2.5">
				<Skeleton className="h-4 w-full rounded" />
				<Skeleton className="h-4 w-11/12 rounded" />
				<Skeleton className="h-4 w-4/5 rounded" />
			</div>

			<div className="mt-5 flex items-center gap-4">
				<Skeleton className="h-3 w-28 rounded" />
				<Skeleton className="h-3 w-14 rounded" />
				<Skeleton className="h-3 w-16 rounded" />
			</div>

			<div className="mt-4 flex items-center justify-between border-t border-[var(--border)]/50 pt-3">
				<Skeleton className="h-7 w-14 rounded-full" />
				<Skeleton className="h-7 w-14 rounded-full" />
				<Skeleton className="h-7 w-10 rounded-full" />
			</div>
		</div>
	);
}
