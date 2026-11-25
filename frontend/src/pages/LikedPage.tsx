import { ThumbsUpIcon } from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { useLikedVideos } from '@/features/liked/hooks/useLikedVideos';
import { VideoCard } from '@/features/videos/components/VideoCard';
import { VideoCardSkeleton } from '@/features/videos/components/VideoCardSkeleton';

export default function LikedPage() {
	const { data: videos = [], isLoading, isError } = useLikedVideos();

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
				<header className="space-y-1">
					<h1 className="text-2xl font-bold text-[var(--foreground)]">
						Liked Videos
					</h1>
					<p className="text-sm text-[var(--muted-foreground)]">
						Videos you have liked across NovaPlay.
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
						icon={<ThumbsUpIcon size={40} />}
						title="Unable to load liked videos"
						description="Please refresh or try again in a moment."
					/>
				) : videos.length === 0 ? (
					<EmptyState
						icon={<ThumbsUpIcon size={40} />}
						title="No liked videos yet"
						description="Like videos while watching to save them here."
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
									views: video.views ?? 0,
									createdAt: video.createdAt ?? new Date().toISOString(),
									owner: {
										_id: video.owner._id,
										fullName: video.owner.fullName ?? video.owner.username,
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
