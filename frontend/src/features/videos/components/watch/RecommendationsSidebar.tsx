import { useVideos } from '../../hooks/useVideos';
import { transformVideosToCardData } from '../../transformers/video-card.transformer';
import { VideoCard } from '../VideoCard';
import { VideoCardSkeleton } from '../VideoCardSkeleton';

export interface RecommendationsSidebarProps {
	currentVideoId: string;
}

export function RecommendationsSidebar({
	currentVideoId,
}: RecommendationsSidebarProps) {
	const { data, isLoading } = useVideos({ limit: 12 });

	const videos = transformVideosToCardData(data?.docs ?? []).filter(
		(v) => v._id !== currentVideoId,
	);

	return (
		<div className="space-y-4">
			<h3 className="text-base font-bold tracking-tight text-foreground">
				Up Next
			</h3>

			{isLoading ? (
				<div className="space-y-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<VideoCardSkeleton key={i} layout="horizontal" />
					))}
				</div>
			) : videos.length > 0 ? (
				<div className="space-y-2">
					{videos.map((v) => (
						<VideoCard key={v._id} video={v} layout="horizontal" />
					))}
				</div>
			) : (
				<p className="text-sm text-muted-foreground">
					No recommendations available.
				</p>
			)}
		</div>
	);
}
