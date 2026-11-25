import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	ChatCircleIcon,
	HeartIcon,
	ShareNetworkIcon,
	CheckIcon,
	EyeIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { formatViews } from '@/lib/format-views';
import type { Tweet } from '../types/tweet.types';
import { useToggleTweetLike } from '../hooks/useToggleTweetLike';
import { useAuthStore } from '@/features/auth/auth.store';
import { toast } from 'sonner';

interface Props {
	tweet: Tweet;
	views?: number;
	onCommentClick?: () => void;
}

export function TweetActions({ tweet, views, onCommentClick }: Props) {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuthStore();
	const toggleLikeMutation = useToggleTweetLike();

	const [isLiked, setIsLiked] = useState(tweet.isLiked ?? false);
	const [likesCount, setLikesCount] = useState(tweet.likesCount ?? 0);
	const [copied, setCopied] = useState(false);
	const [prevSyncKey, setPrevSyncKey] = useState(
		`${tweet._id}:${tweet.isLiked ?? false}:${tweet.likesCount ?? 0}`,
	);

	const syncKey = `${tweet._id}:${tweet.isLiked ?? false}:${tweet.likesCount ?? 0}`;
	if (syncKey !== prevSyncKey) {
		setPrevSyncKey(syncKey);
		setIsLiked(tweet.isLiked ?? false);
		setLikesCount(tweet.likesCount ?? 0);
	}

	const handleLike = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isAuthenticated) {
			toast.info('Sign in to like this tweet');
			return;
		}

		// Capture previous values before optimistic update
		const previousLiked = isLiked;
		const previousCount = likesCount;
		const nextLiked = !previousLiked;

		setIsLiked(nextLiked);
		setLikesCount(nextLiked ? previousCount + 1 : Math.max(0, previousCount - 1));

		toggleLikeMutation.mutate(tweet._id, {
			onError: () => {
				// Revert to captured previous state on failure
				setIsLiked(previousLiked);
				setLikesCount(previousCount);
				toast.error('Failed to update like');
			},
		});
	};

	const handleShare = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigator.clipboard.writeText(`${window.location.origin}/tweets/${tweet._id}`);
		setCopied(true);
		toast.success('Link copied to clipboard');
		setTimeout(() => setCopied(false), 2000);
	};

	const handleComment = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onCommentClick) {
			onCommentClick();
			return;
		}
		navigate(`/tweets/${tweet._id}#comments`);
	};

	return (
		<div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={handleLike}
				className={`gap-1.5 rounded-full px-2.5 text-xs transition-colors hover:bg-rose-500/10 hover:text-rose-500 ${
					isLiked ? 'text-rose-500 font-semibold' : 'text-muted-foreground'
				}`}
			>
				<HeartIcon
					size={18}
					weight={isLiked ? 'fill' : 'regular'}
					className={isLiked ? 'text-rose-500 scale-110 transition-transform' : ''}
				/>
				<span>{likesCount}</span>
			</Button>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={handleComment}
				className="gap-1.5 rounded-full px-2.5 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
			>
				<ChatCircleIcon size={18} />
				<span>{tweet.commentsCount ?? 0}</span>
			</Button>

			<span
				aria-label={`${views ?? tweet.views ?? 0} views`}
				title={`${(views ?? tweet.views ?? 0).toLocaleString()} views`}
				className="inline-flex items-center gap-1.5 px-2.5 text-xs text-muted-foreground"
			>
				<EyeIcon size={17} />
				<span>{formatViews(views ?? tweet.views ?? 0)}</span>
			</span>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={handleShare}
				className="rounded-full px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
			>
				{copied ? <CheckIcon size={16} className="text-emerald-500" /> : <ShareNetworkIcon size={18} />}
			</Button>
		</div>
	);
}
