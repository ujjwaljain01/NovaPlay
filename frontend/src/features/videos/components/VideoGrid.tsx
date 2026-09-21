import type { VideoCardData } from '@/types/video.types';
import { VideoCard } from './VideoCard';
import { VideoCardSkeleton } from './VideoCardSkeleton';

interface VideoGridProps {
	videos: VideoCardData[];
	isLoading?: boolean;
	skeletonCount?: number;
	emptyMessage?: string;
}

export function VideoGrid({
	videos,
	isLoading = false,
	skeletonCount = 6,
	emptyMessage = 'No videos found.',
}: VideoGridProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{Array.from({ length: skeletonCount }).map((_, i) => (
					<VideoCardSkeleton key={i} />
				))}
			</div>
		);
	}

	if (!videos || videos.length === 0) {
		return (
			<div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
				<p className="text-base font-medium text-muted-foreground">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{videos.map((video) => (
				<VideoCard key={video._id} video={video} />
			))}
		</div>
	);
}
