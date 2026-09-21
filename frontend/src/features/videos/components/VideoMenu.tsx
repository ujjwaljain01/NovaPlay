import { useState } from 'react';
import { DotsThreeVerticalIcon, ShareNetworkIcon, PlaylistIcon, CopyIcon, CheckIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VideoMenuProps {
	videoId?: string;
}

export function VideoMenu({ videoId }: VideoMenuProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (videoId) {
			navigator.clipboard.writeText(`${window.location.origin}/watch/${videoId}`);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size="icon"
					variant="ghost"
					className="h-8 w-8 shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80"
					onClick={(e) => e.stopPropagation()}
				>
					<DotsThreeVerticalIcon size={18} weight="bold" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg">
				<DropdownMenuItem onClick={handleCopy} className="cursor-pointer gap-2.5 rounded-lg py-2">
					{copied ? <CheckIcon size={16} className="text-emerald-500" /> : <CopyIcon size={16} />}
					<span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
				</DropdownMenuItem>
				<DropdownMenuItem className="cursor-pointer gap-2.5 rounded-lg py-2">
					<PlaylistIcon size={16} />
					<span>Save to Playlist</span>
				</DropdownMenuItem>
				<DropdownMenuItem className="cursor-pointer gap-2.5 rounded-lg py-2">
					<ShareNetworkIcon size={16} />
					<span>Share</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
