import { Skeleton } from '@/components/ui/skeleton';

export function WatchPageSkeleton() {
	return (
		<div className="mx-auto max-w-[1800px] px-4 py-4 lg:px-6">
			<div className="flex flex-col gap-6 xl:flex-row">
				<div className="min-w-0 flex-1 space-y-4">
					<Skeleton className="aspect-video w-full rounded-2xl" />

					<div className="space-y-2">
						<Skeleton className="h-7 w-3/4 rounded-lg" />
						<div className="flex items-center justify-between">
							<Skeleton className="h-4 w-40 rounded" />
							<div className="flex items-center gap-2">
								<Skeleton className="h-8 w-28 rounded-full" />
								<Skeleton className="h-8 w-20 rounded-full" />
								<Skeleton className="h-8 w-20 rounded-full" />
							</div>
						</div>
					</div>

					<Skeleton className="h-36 w-full rounded-2xl" />

					<div className="space-y-4 pt-4">
						<Skeleton className="h-5 w-32 rounded" />
						<Skeleton className="h-16 w-full rounded-xl" />
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="flex gap-3">
								<Skeleton className="h-9 w-9 shrink-0 rounded-full" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-3 w-24 rounded" />
									<Skeleton className="h-3.5 w-full rounded" />
									<Skeleton className="h-3.5 w-2/3 rounded" />
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="w-full shrink-0 space-y-3 xl:w-[400px]">
					<Skeleton className="h-5 w-20 rounded" />
					{Array.from({ length: 8 }).map((_, i) => (
						<div key={i} className="flex gap-3">
							<Skeleton className="aspect-video w-40 shrink-0 rounded-xl" />
							<div className="flex-1 space-y-2 py-1">
								<Skeleton className="h-3.5 w-full rounded" />
								<Skeleton className="h-3 w-3/4 rounded" />
								<Skeleton className="h-3 w-1/2 rounded" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
