import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ClockIcon } from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaylistVideoRow } from '@/features/playlist/components/PlaylistVideoRow';
import { useWatchLater } from '@/features/playlist/hooks/useWatchLater';
import { useRemoveVideoFromPlaylist } from '@/features/playlist/hooks/useRemoveVideoFromPlaylist';
import { ROUTES } from '@/routes/route-paths';

export default function WatchLaterPage() {
	const { data: playlist, isLoading, isError } = useWatchLater();
	const removeVideoMutation = useRemoveVideoFromPlaylist();

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-5xl space-y-6 px-4 py-6 lg:px-6">
				<Link to={ROUTES.PLAYLISTS}>
					<Button variant="ghost" size="sm" className="gap-1.5 rounded-full">
						<ArrowLeftIcon size={15} />
						<span>Back to playlists</span>
					</Button>
				</Link>

				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-8 w-64 rounded-lg bg-[var(--skeleton)]" />
						<Skeleton className="h-4 w-96 rounded bg-[var(--skeleton)]" />
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-24 w-full rounded-xl bg-[var(--skeleton)]"
							/>
						))}
					</div>
				) : isError || !playlist ? (
					<EmptyState
						icon={<ClockIcon size={40} />}
						title="Unable to load Watch Later"
						description="Please refresh or try again in a moment."
					/>
				) : (
					<>
						<header className="space-y-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
							<div className="flex items-center gap-2.5">
								<ClockIcon size={24} className="text-[var(--primary)]" />
								<h1 className="text-2xl font-bold text-[var(--foreground)]">
									{playlist.name}
								</h1>
							</div>
							<p className="text-sm text-[var(--muted-foreground)]">
								{playlist.description || 'Saved videos to watch later'}
							</p>
							<p className="pt-1 text-xs text-[var(--muted-foreground)]">
								{playlist.videos.length}{' '}
								{playlist.videos.length === 1 ? 'video' : 'videos'}
							</p>
						</header>

						{playlist.videos.length === 0 ? (
							<EmptyState
								icon={<ClockIcon size={40} />}
								title="No videos in Watch Later"
								description="Save videos from any video card menu to watch them later."
							/>
						) : (
							<div className="space-y-3">
								{playlist.videos.map((video) => (
									<PlaylistVideoRow
										key={video._id}
										_id={video._id}
										title={video.title}
										thumbnail={video.thumbnail}
										duration={video.duration}
										ownerName={video.owner?.fullName}
										isRemoving={removeVideoMutation.isPending}
										onRemove={(videoId) =>
											removeVideoMutation.mutate({
												videoId,
												playlistId: playlist._id,
											})
										}
									/>
								))}
							</div>
						)}
					</>
				)}
			</div>
		</ErrorBoundary>
	);
}
