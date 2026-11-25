import { Link } from 'react-router-dom';
import { PlaylistIcon } from '@phosphor-icons/react';
import { HashtagText } from '@/components/common/HashtagText';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDuration } from '@/lib/format-duration';
import { formatUploadTime } from '@/lib/format-upload-time';
import { formatViews } from '@/lib/format-views';
import type { SearchResult } from '../types/search.schemas';

interface SearchResultCardProps {
	result: SearchResult;
}

export function SearchResultCard({ result }: SearchResultCardProps) {
	if (result.contentType === 'video') {
		return (
			<article className="group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 transition-colors hover:bg-[var(--video-card-hover)] sm:flex-row">
				<Link
					to={`/watch/${result._id}`}
					className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-[var(--muted)] sm:w-64"
				>
					<img
						src={result.thumbnail}
						alt={result.title}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>
					<span className="absolute bottom-1.5 right-1.5 rounded bg-[var(--background)]/85 px-1.5 py-0.5 text-[11px] font-semibold text-[var(--foreground)]">
						{formatDuration(result.duration)}
					</span>
				</Link>

				<div className="min-w-0 flex-1 space-y-1.5">
					<Link
						to={`/watch/${result._id}`}
						className="line-clamp-2 text-base font-semibold text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]"
					>
						{result.title}
					</Link>
					<p className="text-xs text-[var(--muted-foreground)]">
						{formatViews(result.views)} views • {formatUploadTime(result.createdAt)}
					</p>
					<Link
						to={`/channel/${result.owner.username}`}
						className="inline-flex items-center gap-2 pt-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
					>
						<Avatar className="h-6 w-6">
							<AvatarImage src={result.owner.avatar} alt={result.owner.fullName} />
							<AvatarFallback>{result.owner.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
						</Avatar>
						<span>{result.owner.fullName}</span>
					</Link>
					<p className="line-clamp-2 text-xs text-[var(--muted-foreground)]">
						{result.description}
					</p>
				</div>
			</article>
		);
	}

	if (result.contentType === 'channel') {
		return (
			<Link
				to={`/channel/${result.username}`}
				className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:bg-[var(--video-card-hover)]"
			>
				<Avatar className="h-14 w-14 shrink-0 ring-1 ring-[var(--border)]">
					<AvatarImage src={result.avatar} alt={result.fullName} />
					<AvatarFallback>{result.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1">
					<h3 className="truncate text-base font-semibold text-[var(--foreground)]">
						{result.fullName}
					</h3>
					<p className="truncate text-sm text-[var(--muted-foreground)]">
						@{result.username}
					</p>
				</div>
				<span className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
					Channel
				</span>
			</Link>
		);
	}

	if (result.contentType === 'playlist') {
		return (
			<Link
				to={`/playlists/${result._id}`}
				className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:bg-[var(--video-card-hover)]"
			>
				<div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)]">
					<PlaylistIcon size={28} />
				</div>
				<div className="min-w-0 flex-1 space-y-1">
					<h3 className="truncate text-base font-semibold text-[var(--foreground)]">
						{result.name}
					</h3>
					<p className="line-clamp-1 text-xs text-[var(--muted-foreground)]">
						{result.description}
					</p>
					<p className="text-xs text-[var(--muted-foreground)]">
						By {result.owner.fullName}
					</p>
				</div>
			</Link>
		);
	}

	return (
		<article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
			<div className="flex items-center gap-2.5">
				<Link to={`/channel/${result.owner.username}`}>
					<Avatar className="h-8 w-8">
						<AvatarImage src={result.owner.avatar} alt={result.owner.fullName} />
						<AvatarFallback>{result.owner.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
					</Avatar>
				</Link>
				<div className="min-w-0">
					<Link
						to={`/channel/${result.owner.username}`}
						className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)]"
					>
						{result.owner.fullName}
					</Link>
					<p className="text-xs text-[var(--muted-foreground)]">
						@{result.owner.username} • {formatUploadTime(result.createdAt)} •{' '}
						{formatViews(result.views ?? 0)}{' '}
						{(result.views ?? 0) === 1 ? 'view' : 'views'}
					</p>
				</div>
			</div>
			<Link
				to={`/tweets/${result._id}`}
				className="mt-2.5 block whitespace-pre-line text-sm text-[var(--foreground)] hover:text-[var(--foreground)]"
			>
				<HashtagText text={result.content} />
			</Link>
		</article>
	);
}
