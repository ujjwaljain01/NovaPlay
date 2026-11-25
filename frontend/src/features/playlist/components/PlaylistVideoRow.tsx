import { Link } from 'react-router-dom';
import { TrashIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/format-duration';
import type { PlaylistVideoStub } from '../types/playlist.schemas';

interface PlaylistVideoRowProps {
	_id: PlaylistVideoStub['_id'];
	title: PlaylistVideoStub['title'];
	thumbnail: PlaylistVideoStub['thumbnail'];
	duration: PlaylistVideoStub['duration'];
	ownerName?: string;
	isRemoving?: boolean;
	onRemove?: (videoId: string) => void;
}

export function PlaylistVideoRow({
	_id,
	title,
	thumbnail,
	duration,
	ownerName,
	isRemoving = false,
	onRemove,
}: PlaylistVideoRowProps) {
	return (
		<div className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5 transition-colors hover:bg-[var(--video-card-hover)]">
			<Link
				to={`/watch/${_id}`}
				className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-lg bg-[var(--muted)]"
			>
				<img
					src={thumbnail}
					alt={title}
					className="h-full w-full object-cover"
					loading="lazy"
				/>
				<span className="absolute bottom-1 right-1 rounded bg-[var(--background)]/85 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--foreground)]">
					{formatDuration(duration)}
				</span>
			</Link>

			<div className="min-w-0 flex-1">
				<Link
					to={`/watch/${_id}`}
					className="line-clamp-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
				>
					{title}
				</Link>
				{ownerName ? (
					<p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
						{ownerName}
					</p>
				) : null}
			</div>

			{onRemove ? (
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					disabled={isRemoving}
					onClick={() => onRemove(_id)}
					aria-label={`Remove ${title} from playlist`}
					className="shrink-0 text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
				>
					<TrashIcon size={16} />
				</Button>
			) : null}
		</div>
	);
}
