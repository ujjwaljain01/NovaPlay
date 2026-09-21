import type { Tweet } from '../types/tweet.types';
import { TweetHeader } from './TweetHeader';
import { TweetContent } from './TweetContent';
import { TweetActions } from './TweetActions';

interface TweetCardProps {
	tweet: Tweet;
}

export function TweetCard({ tweet }: TweetCardProps) {
	return (
		<article
			className="
				group
				flex
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
			"
		>
			<div>
				<TweetHeader owner={tweet.owner} createdAt={tweet.createdAt} />
				<TweetContent content={tweet.content} />
			</div>

			<TweetActions tweet={tweet} />
		</article>
	);
}
