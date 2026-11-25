import { VideoCameraIcon } from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { VideoGrid } from '@/features/videos/components/VideoGrid';
import { useVideos } from '@/features/videos/hooks/useVideos';
import { transformVideosToCardData } from '@/features/videos/transformers/video-card.transformer';

export default function VideosPage() {
	const { data, isLoading, isError } = useVideos({ limit: 24 });
	const videos = transformVideosToCardData(data?.docs ?? []);

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
				<header className="space-y-1">
					<h1 className="text-2xl font-bold text-foreground">Videos</h1>
					<p className="text-sm text-muted-foreground">
						Explore the latest published videos across NovaPlay.
					</p>
				</header>

				{isError ? (
					<EmptyState
						icon={<VideoCameraIcon size={40} />}
						title="Unable to load videos"
						description="Please try again in a moment."
					/>
				) : (
					<VideoGrid
						videos={videos}
						isLoading={isLoading}
						skeletonCount={8}
						emptyMessage="No videos found."
					/>
				)}
			</div>
		</ErrorBoundary>
	);
}
