import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ChatTeardropTextIcon } from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentSection } from '@/features/comments/components/CommentSection';
import {
	TweetDetailCard,
	TweetDetailCardSkeleton,
	useTweet,
} from '@/features/tweets';
import { ROUTES } from '@/routes/route-paths';

export default function TweetWatchPage() {
	const { tweetId = '' } = useParams<{ tweetId: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const commentsSectionRef = useRef<HTMLDivElement>(null);

	const { data: tweet, isLoading, isError } = useTweet(tweetId);

	useEffect(() => {
		if (location.hash === '#comments' && tweet) {
			commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
			return;
		}
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [tweetId, location.hash, tweet]);

	const handleBack = () => {
		if (window.history.length > 1) {
			navigate(-1);
			return;
		}
		navigate(ROUTES.HOME);
	};

	const handleFocusComments = () => {
		commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
		const textarea = commentsSectionRef.current?.querySelector('textarea');
		textarea?.focus();
	};

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-3xl space-y-6 px-4 py-6 lg:px-6">
				<div className="flex items-center gap-3">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={handleBack}
						className="gap-1.5 rounded-full px-3 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
					>
						<ArrowLeftIcon size={16} />
						<span>Back</span>
					</Button>
				</div>

				{isLoading ? (
					<TweetWatchPageSkeleton />
				) : isError || !tweet ? (
					<EmptyState
						icon={<ChatTeardropTextIcon size={44} />}
						title="Tweet not found"
						description="This tweet may have been deleted or the link is invalid."
						action={
							<Link to={ROUTES.HOME}>
								<Button variant="outline" className="rounded-full">
									Back to Home
								</Button>
							</Link>
						}
					/>
				) : (
					<>
						<TweetDetailCard
							tweet={tweet}
							onCommentClick={handleFocusComments}
						/>

						<Separator className="bg-[var(--border)]/60" />

						<div id="comments" ref={commentsSectionRef}>
							<CommentSection
								targetId={tweet._id}
								enableReplies
								totalCommentsCount={tweet.commentsCount}
							/>
						</div>
					</>
				)}
			</div>
		</ErrorBoundary>
	);
}

function TweetWatchPageSkeleton() {
	return (
		<div className="space-y-6">
			<TweetDetailCardSkeleton />
			<Separator className="bg-[var(--border)]/60" />
			<div className="space-y-4">
				<Skeleton className="h-6 w-32 rounded" />
				<Skeleton className="h-12 w-full rounded-xl" />
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="flex gap-3 py-2">
						<Skeleton className="h-9 w-9 shrink-0 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-3 w-28 rounded" />
							<Skeleton className="h-3.5 w-full rounded" />
							<Skeleton className="h-3.5 w-2/3 rounded" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
