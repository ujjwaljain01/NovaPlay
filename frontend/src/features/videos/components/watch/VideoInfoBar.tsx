import { useState } from 'react';
import {
	ThumbsUpIcon,
	ThumbsDownIcon,
	ShareNetworkIcon,
	PlaylistIcon,
	DotsThreeIcon,
	CheckIcon,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { formatViews } from '@/lib/format-views';
import { formatUploadTime } from '@/lib/format-upload-time';

export interface VideoInfoBarProps {
	title: string;
	views: number;
	createdAt: string;
	likeCount: number;
	isLiked: boolean;
	isAuthenticated: boolean;
	isLikePending?: boolean;
	onToggleLike: () => void;
}

export function VideoInfoBar({
	title,
	views,
	createdAt,
	likeCount,
	isLiked,
	isAuthenticated,
	isLikePending = false,
	onToggleLike,
}: VideoInfoBarProps) {
	const [disliked, setDisliked] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleLike = () => {
		if (!isAuthenticated) {
			toast.info('Sign in to like this video');
			return;
		}
		if (disliked) setDisliked(false);
		onToggleLike();
	};

	const handleDislike = () => {
		if (!isAuthenticated) {
			toast.info('Sign in to dislike this video');
			return;
		}
		const nextDisliked = !disliked;
		setDisliked(nextDisliked);
		if (nextDisliked && isLiked) {
			onToggleLike();
		}
	};

	const handleShare = () => {
		navigator.clipboard.writeText(window.location.href);
		setCopied(true);
		toast.success('Link copied!');
		setTimeout(() => setCopied(false), 2000);
	};

	const handleSave = () => {
		if (!isAuthenticated) {
			toast.info('Sign in to save to playlist');
			return;
		}
		toast.info('Playlist feature coming soon!');
	};

	return (
		<div className="space-y-2">
			<h1 className="text-lg font-bold leading-snug tracking-tight text-foreground sm:text-xl lg:text-2xl">
				{title}
			</h1>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span>{formatViews(views)} views</span>
					<span>•</span>
					<span>{formatUploadTime(createdAt)}</span>
				</div>

				<div className="flex items-center gap-1.5">
					<div className="flex items-center overflow-hidden rounded-full border border-border/60 bg-muted/50">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleLike}
							disabled={isLikePending}
							aria-pressed={isLiked}
							className={`gap-1.5 rounded-none rounded-l-full border-r border-border/40 px-3.5 py-2 text-xs font-semibold transition-colors ${
								isLiked ? 'bg-primary/10 text-primary' : 'text-foreground'
							}`}
						>
							<ThumbsUpIcon size={18} weight={isLiked ? 'fill' : 'regular'} />
							<span>{likeCount > 0 ? likeCount : 'Like'}</span>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleDislike}
							aria-pressed={disliked}
							className={`rounded-none rounded-r-full px-3 py-2 text-xs transition-colors ${
								disliked ? 'bg-muted text-foreground' : 'text-foreground'
							}`}
						>
							<ThumbsDownIcon size={18} weight={disliked ? 'fill' : 'regular'} />
						</Button>
					</div>

					<Button
						variant="secondary"
						size="sm"
						onClick={handleShare}
						className="gap-1.5 rounded-full px-4 text-xs font-semibold"
					>
						{copied ? (
							<CheckIcon size={16} className="text-[var(--success)]" />
						) : (
							<ShareNetworkIcon size={16} />
						)}
						<span>{copied ? 'Copied' : 'Share'}</span>
					</Button>

					<Button
						variant="secondary"
						size="sm"
						onClick={handleSave}
						className="gap-1.5 rounded-full px-4 text-xs font-semibold"
					>
						<PlaylistIcon size={16} />
						<span>Save</span>
					</Button>

					<Button
						variant="secondary"
						size="icon"
						className="h-8 w-8 rounded-full sm:hidden"
					>
						<DotsThreeIcon size={18} />
					</Button>
				</div>
			</div>
		</div>
	);
}
