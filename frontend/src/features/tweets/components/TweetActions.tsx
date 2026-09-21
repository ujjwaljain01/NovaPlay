import { useState } from 'react';
import {
	ChatCircleIcon,
	HeartIcon,
	ShareNetworkIcon,
	CheckIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import type { Tweet } from '../types/tweet.types';
import { useToggleTweetLike } from '../hooks/useToggleTweetLike';
import { useAuthStore } from '@/features/auth/auth.store';
import { toast } from 'sonner';

interface Props {
	tweet: Tweet;
}

export function TweetActions({ tweet }: Props) {
	const { isAuthenticated } = useAuthStore();
	const toggleLikeMutation = useToggleTweetLike();

	const [isLiked, setIsLiked] = useState(tweet.isLiked ?? false);
	const [likesCount, setLikesCount] = useState(tweet.likesCount ?? 0);
	const [copied, setCopied] = useState(false);

	const handleLike = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isAuthenticated) {
			toast.info('Sign in to like this tweet');
			return;
		}

		// Optimistic update
		const nextLiked = !isLiked;
		setIsLiked(nextLiked);
		setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

		toggleLikeMutation.mutate(tweet._id, {
			onError: () => {
				// Revert on failure
				setIsLiked(!nextLiked);
				setLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
				toast.error('Failed to update like');
			},
		});
	};

	const handleShare = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigator.clipboard.writeText(`${window.location.origin}/tweets#${tweet._id}`);
		setCopied(true);
		toast.success('Link copied to clipboard');
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
			<Button
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
				variant="ghost"
				size="sm"
				className="gap-1.5 rounded-full px-2.5 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
			>
				<ChatCircleIcon size={18} />
				<span>{tweet.commentsCount ?? 0}</span>
			</Button>

			<Button
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
