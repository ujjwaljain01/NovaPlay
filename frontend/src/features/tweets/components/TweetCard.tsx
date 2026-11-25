import type { KeyboardEvent, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Tweet } from '../types/tweet.types';
import { useTweetViewTracker } from '../hooks/useTweetViewTracker';
import { TweetHeader } from './TweetHeader';
import { TweetContent } from './TweetContent';
import { TweetActions } from './TweetActions';

interface TweetCardProps {
	tweet: Tweet;
}

function isInteractiveChild(target: EventTarget | null): boolean {
	return (
		target instanceof HTMLElement &&
		Boolean(
			target.closest(
				'a, button, input, textarea, select, [role="button"], [data-no-card-nav]',
			),
		)
	);
}

export function TweetCard({ tweet }: TweetCardProps) {
	const navigate = useNavigate();
	const tweetPath = `/tweets/${tweet._id}`;
	const { ref: viewTrackerRef, displayViews } = useTweetViewTracker({
		tweetId: tweet._id,
		initialViews: tweet.views ?? 0,
	});

	const handleClick = (e: MouseEvent<HTMLElement>) => {
		if (isInteractiveChild(e.target)) return;
		navigate(tweetPath);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
		if (isInteractiveChild(e.target)) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			navigate(tweetPath);
		}
	};

	const authorName = tweet.owner?.fullName || tweet.owner?.username || 'user';

	return (
		<article
			ref={viewTrackerRef}
			role="link"
			tabIndex={0}
			aria-label={`View tweet by ${authorName}`}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			className="
				group
				flex
				cursor-pointer
				flex-col
				justify-between
				rounded-2xl
				border
				border-border/60
				bg-card/70
				p-5
				backdrop-blur-sm
				shadow-sm
				transition-all
				duration-300
				hover:border-primary/40
				hover:bg-card
				hover:shadow-md
				focus-visible:outline-none
				focus-visible:ring-2
				focus-visible:ring-ring
			"
		>
			<div>
				<TweetHeader owner={tweet.owner} createdAt={tweet.createdAt} />
				<TweetContent content={tweet.content} />
			</div>

			<TweetActions tweet={tweet} views={displayViews} />
		</article>
	);
}
