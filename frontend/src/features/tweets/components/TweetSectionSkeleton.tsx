import { Skeleton } from '@/components/ui/skeleton';
import { TweetCardSkeleton } from './TweetCardSkeleton';

interface TweetSectionSkeletonProps {
	count?: number;
}

export function TweetSectionSkeleton({ count = 4 }: TweetSectionSkeletonProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2.5">
					<Skeleton className="h-8 w-8 rounded-xl" />
					<Skeleton className="h-7 w-44 rounded-lg" />
				</div>
				<Skeleton className="h-4 w-28 rounded" />
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: count }).map((_, i) => (
					<TweetCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}
