import { Skeleton } from '@/components/ui/skeleton';
import { VideoCardSkeleton } from './VideoCardSkeleton';

interface VideoSectionSkeletonProps {
	count?: number;
}

export function VideoSectionSkeleton({ count = 3 }: VideoSectionSkeletonProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-7 w-48 rounded-lg" />
				<Skeleton className="h-4 w-16 rounded" />
			</div>

			<div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
				{Array.from({ length: count }).map((_, i) => (
					<VideoCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}
