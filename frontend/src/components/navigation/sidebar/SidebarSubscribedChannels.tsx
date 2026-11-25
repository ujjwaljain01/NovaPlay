import { Link } from 'react-router-dom';
import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/auth.store';
import { useSidebarSubscribedChannels } from '@/features/subscriptions/hooks/useSidebarSubscribedChannels';

interface SidebarSubscribedChannelsProps {
	enabled: boolean;
}

export function SidebarSubscribedChannels({
	enabled,
}: SidebarSubscribedChannelsProps) {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const {
		channels,
		totalCount,
		isLoading,
		isFetchingNextPage,
		isError,
		canShowMore,
		canShowLess,
		showMore,
		showLess,
	} = useSidebarSubscribedChannels(enabled && isAuthenticated);

	if (!enabled || !isAuthenticated) {
		return null;
	}

	return (
		<div className="mt-2 px-2.5">
			<div className="mb-1 flex items-center justify-between px-2.5">
				<span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
					Channels
				</span>
				{totalCount > 0 && (
					<span className="text-[11px] text-muted-foreground">
						{totalCount}
					</span>
				)}
			</div>

			{isLoading ? (
				<div className="space-y-1.5 px-2 py-1">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="flex items-center gap-2.5 py-1">
							<Skeleton className="h-6 w-6 shrink-0 rounded-full" />
							<Skeleton className="h-3.5 flex-1 rounded" />
						</div>
					))}
				</div>
			) : isError ? (
				<p className="px-2.5 py-1.5 text-xs text-muted-foreground">
					Unable to load channels
				</p>
			) : channels.length === 0 ? (
				<p className="px-2.5 py-1.5 text-xs text-muted-foreground">
					No subscribed channels yet
				</p>
			) : (
				<div className="space-y-0.5">
					{channels.map((channel) => {
						const initials = (channel.fullName || channel.username)
							.slice(0, 2)
							.toUpperCase();

						return (
							<Link
								key={channel._id}
								to={`/channel/${channel.username}`}
								className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-accent/60"
							>
								<Avatar className="h-6 w-6 shrink-0 ring-1 ring-border/50">
									<AvatarImage
										src={channel.avatar}
										alt={channel.username}
									/>
									<AvatarFallback className="text-[10px] font-semibold">
										{initials}
									</AvatarFallback>
								</Avatar>
								<span className="min-w-0 flex-1 truncate text-xs font-medium">
									{channel.username}
								</span>
							</Link>
						);
					})}

					{canShowMore && (
						<button
							type="button"
							onClick={() => void showMore()}
							disabled={isFetchingNextPage}
							className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground disabled:opacity-50"
						>
							<CaretDownIcon size={15} className="shrink-0" />
							<span>
								{isFetchingNextPage ? 'Loading...' : 'Show more'}
							</span>
						</button>
					)}

					{canShowLess && (
						<button
							type="button"
							onClick={showLess}
							className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
						>
							<CaretUpIcon size={15} className="shrink-0" />
							<span>Show less</span>
						</button>
					)}
				</div>
			)}
		</div>
	);
}
