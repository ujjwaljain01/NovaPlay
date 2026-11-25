import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	CheckIcon,
	ClockIcon,
	CopyIcon,
	DotsThreeVerticalIcon,
	ShareNetworkIcon,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/features/auth/auth.store';
import { useSaveToWatchLater } from '@/features/playlist/hooks/useSaveToWatchLater';
import { ROUTES } from '@/routes/route-paths';

interface VideoMenuProps {
	videoId?: string;
}

export function VideoMenu({ videoId }: VideoMenuProps) {
	const [copied, setCopied] = useState(false);
	const navigate = useNavigate();
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const saveToWatchLaterMutation = useSaveToWatchLater();

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (videoId) {
			void navigator.clipboard.writeText(
				`${window.location.origin}/watch/${videoId}`,
			);
			setCopied(true);
			toast.success('Link copied to clipboard');
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleSaveToWatchLater = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!videoId) return;

		if (!isAuthenticated) {
			toast.info('Sign in to save videos to Watch Later');
			navigate(ROUTES.LOGIN);
			return;
		}

		saveToWatchLaterMutation.mutate(videoId);
	};

	const handleShare = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!videoId) return;
		const url = `${window.location.origin}/watch/${videoId}`;

		if (navigator.share) {
			try {
				await navigator.share({ url });
				return;
			} catch {
				// Ignore user cancel or fall back to clipboard
			}
		}

		await navigator.clipboard.writeText(url);
		toast.success('Video link copied to share');
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						size="icon"
						variant="ghost"
						aria-label="Video options"
						className="h-8 w-8 shrink-0 rounded-full text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
						onClick={(e) => e.stopPropagation()}
					/>
				}
			>
				<DotsThreeVerticalIcon size={18} weight="bold" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52 rounded-xl p-1 shadow-lg">
				<DropdownMenuItem
					onClick={handleSaveToWatchLater}
					disabled={saveToWatchLaterMutation.isPending}
					className="cursor-pointer gap-2.5 rounded-lg py-2"
				>
					<ClockIcon size={16} />
					<span>Save to Watch Later</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleCopy}
					className="cursor-pointer gap-2.5 rounded-lg py-2"
				>
					{copied ? (
						<CheckIcon size={16} className="text-[var(--success)]" />
					) : (
						<CopyIcon size={16} />
					)}
					<span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleShare}
					className="cursor-pointer gap-2.5 rounded-lg py-2"
				>
					<ShareNetworkIcon size={16} />
					<span>Share</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
