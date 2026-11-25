import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PlaylistIcon } from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaylistVideoRow } from '@/features/playlist/components/PlaylistVideoRow';
import { usePlaylistDetail } from '@/features/playlist/hooks/usePlaylistDetail';
import { useRemoveVideoFromPlaylist } from '@/features/playlist/hooks/useRemoveVideoFromPlaylist';
import { ROUTES } from '@/routes/route-paths';

export default function PlaylistDetailPage() {
	const { playlistId = '' } = useParams<{ playlistId: string }>();
	const { data: playlist, isLoading, isError } = usePlaylistDetail(playlistId);
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
						<Skeleton className="h-8 w-64 rounded-lg" />
						<Skeleton className="h-4 w-96 rounded" />
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-24 w-full rounded-xl" />
						))}
					</div>
				) : isError || !playlist ? (
					<EmptyState
						icon={<PlaylistIcon size={40} />}
						title="Playlist not found"
						description="This playlist may have been deleted or could not be loaded."
					/>
				) : (
					<>
						<header className="space-y-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
							<h1 className="text-2xl font-bold text-[var(--foreground)]">
								{playlist.name}
							</h1>
							<p className="text-sm text-[var(--muted-foreground)]">
								{playlist.description}
							</p>
							<p className="pt-1 text-xs text-[var(--muted-foreground)]">
								{playlist.videos.length}{' '}
								{playlist.videos.length === 1 ? 'video' : 'videos'}
							</p>
						</header>

						{playlist.videos.length === 0 ? (
							<EmptyState
								icon={<PlaylistIcon size={40} />}
								title="No videos in this playlist"
								description="Add videos to this playlist to watch them here."
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
