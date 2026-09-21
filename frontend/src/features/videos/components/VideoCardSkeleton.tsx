import { Skeleton } from '@/components/ui/skeleton';

interface VideoCardSkeletonProps {
	layout?: 'vertical' | 'horizontal';
}

export function VideoCardSkeleton({ layout = 'vertical' }: VideoCardSkeletonProps) {
	if (layout === 'horizontal') {
		return (
			<div className="flex gap-3 p-1.5">
				<Skeleton className="aspect-video w-40 shrink-0 rounded-xl" />
				<div className="flex-1 space-y-2 py-1">
					<Skeleton className="h-3.5 w-full rounded" />
					<Skeleton className="h-3 w-3/4 rounded" />
					<Skeleton className="h-3 w-1/2 rounded" />
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col space-y-3">
			<Skeleton className="aspect-video w-full rounded-2xl" />
			<div className="flex items-start gap-3">
				<Skeleton className="h-9 w-9 shrink-0 rounded-full" />
				<div className="flex-1 space-y-2 pt-0.5">
					<Skeleton className="h-4 w-full rounded-md" />
					<Skeleton className="h-3 w-2/3 rounded-md" />
					<Skeleton className="h-3 w-1/3 rounded-md" />
				</div>
			</div>
		</div>
	);
}
