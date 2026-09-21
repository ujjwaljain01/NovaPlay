import { Link } from 'react-router-dom';
import { CaretRightIcon, ChatsTeardropIcon } from '@phosphor-icons/react';
import type { Tweet } from '../types/tweet.types';
import { TweetCard } from './TweetCard';

interface TweetSectionProps {
	title: string;
	tweets: Tweet[];
	viewAllHref?: string;
}

export function TweetSection({
	title,
	tweets,
	viewAllHref = '/tweets',
}: TweetSectionProps) {
	if (!tweets || tweets.length === 0) return null;

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2.5">
					<span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
						<ChatsTeardropIcon size={20} weight="fill" />
					</span>
					<h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
						{title}
					</h2>
				</div>

				{viewAllHref && (
					<Link
						to={viewAllHref}
						className="group flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
					>
						<span>Explore community</span>
						<CaretRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
					</Link>
				)}
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{tweets.map((tweet) => (
					<TweetCard key={tweet._id} tweet={tweet} />
				))}
			</div>
		</section>
	);
}
