import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { useWatchHistory } from '@/features/history/hooks/useWatchHistory';
import { VideoCard } from '@/features/videos/components/VideoCard';
import { VideoCardSkeleton } from '@/features/videos/components/VideoCardSkeleton';

export default function HistoryPage() {
	const { data: videos = [], isLoading, isError } = useWatchHistory();

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
				<header className="space-y-1">
					<h1 className="text-2xl font-bold text-[var(--foreground)]">
						Watch History
					</h1>
					<p className="text-sm text-[var(--muted-foreground)]">
						Videos you have watched recently.
					</p>
				</header>

				{isLoading ? (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<VideoCardSkeleton key={i} />
						))}
					</div>
				) : isError ? (
					<EmptyState
						icon={<ClockCounterClockwiseIcon size={40} />}
						title="Unable to load watch history"
						description="Please refresh or try again in a moment."
					/>
				) : videos.length === 0 ? (
					<EmptyState
						icon={<ClockCounterClockwiseIcon size={40} />}
						title="No watch history yet"
						description="Videos you watch will appear here."
					/>
				) : (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{videos.map((video) => (
							<VideoCard
								key={video._id}
								video={{
									_id: video._id,
									title: video.title,
									thumbnail: video.thumbnail,
									duration: video.duration,
									views: video.views,
									createdAt: video.createdAt,
									owner: {
										_id: video.owner._id ?? '',
										fullName: video.owner.fullName,
										username: video.owner.username,
										avatar: video.owner.avatar,
									},
								}}
							/>
						))}
					</div>
				)}
			</div>
		</ErrorBoundary>
	);
}
