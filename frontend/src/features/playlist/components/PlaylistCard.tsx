import { Link } from 'react-router-dom';
import { PencilSimpleIcon, PlaylistIcon, TrashIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import type { Playlist } from '../types/playlist.schemas';

interface PlaylistCardProps {
	_id: Playlist['_id'];
	name: Playlist['name'];
	description: Playlist['description'];
	totalVideos: Playlist['totalVideos'];
	firstVideoThumbnail?: Playlist['firstVideoThumbnail'];
	isSystem?: boolean;
	onEdit?: () => void;
	onDelete?: () => void;
}

export function PlaylistCard({
	_id,
	name,
	description,
	totalVideos,
	firstVideoThumbnail,
	isSystem = false,
	onEdit,
	onDelete,
}: PlaylistCardProps) {
	const detailHref = isSystem ? '/playlists/watch-later' : `/playlists/${_id}`;

	return (
		<article className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-colors hover:bg-[var(--video-card-hover)]">
			<Link
				to={detailHref}
				className="relative aspect-video w-full overflow-hidden bg-[var(--muted)]"
			>
				{firstVideoThumbnail ? (
					<img
						src={firstVideoThumbnail}
						alt={name}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-[var(--muted-foreground)]">
						<PlaylistIcon size={40} />
					</div>
				)}
				<div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-[var(--background)]/85 px-2 py-0.5 text-xs font-semibold text-[var(--foreground)] backdrop-blur-xs">
					<PlaylistIcon size={13} />
					<span>
						{totalVideos} {totalVideos === 1 ? 'video' : 'videos'}
					</span>
				</div>
			</Link>

			<div className="flex flex-1 items-start justify-between gap-2 p-3.5">
				<Link to={detailHref} className="min-w-0 flex-1 space-y-1">
					<h3 className="truncate text-sm font-semibold text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
						{name}
					</h3>
					<p className="line-clamp-2 text-xs text-[var(--muted-foreground)]">
						{description}
					</p>
				</Link>

				{!isSystem && (onEdit || onDelete) ? (
					<div className="flex shrink-0 items-center gap-1">
						{onEdit ? (
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								onClick={onEdit}
								aria-label={`Edit ${name}`}
								className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
							>
								<PencilSimpleIcon size={15} />
							</Button>
						) : null}
						{onDelete ? (
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								onClick={onDelete}
								aria-label={`Delete ${name}`}
								className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
							>
								<TrashIcon size={15} />
							</Button>
						) : null}
					</div>
				) : null}
			</div>
		</article>
	);
}
