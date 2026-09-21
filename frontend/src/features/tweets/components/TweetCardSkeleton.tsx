import { Skeleton } from '@/components/ui/skeleton';

export function TweetCardSkeleton() {
	return (
		<div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/40 p-5 shadow-sm">
			<div>
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Skeleton className="h-10 w-10 rounded-full" />
						<div className="space-y-1.5">
							<Skeleton className="h-3.5 w-24 rounded" />
							<Skeleton className="h-3 w-16 rounded" />
						</div>
					</div>
					<Skeleton className="h-3 w-12 rounded" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-3.5 w-full rounded" />
					<Skeleton className="h-3.5 w-5/6 rounded" />
					<Skeleton className="h-3.5 w-3/4 rounded" />
				</div>
			</div>

			<div className="mt-6 flex items-center justify-between border-t border-border/40 pt-3">
				<Skeleton className="h-7 w-14 rounded-full" />
				<Skeleton className="h-7 w-14 rounded-full" />
				<Skeleton className="h-7 w-8 rounded-full" />
			</div>
		</div>
	);
}
