import { Link } from 'react-router-dom';
import { UsersThreeIcon } from '@phosphor-icons/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmptyState } from '@/components/common/EmptyState';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/auth.store';
import { useSubscriptions } from '@/features/subscriptions/hooks/useSubscriptions';

export default function SubscriptionsPage() {
	const userId = useAuthStore((s) => s.user?._id ?? '');
	const {
		data: channels = [],
		isLoading,
		isError,
	} = useSubscriptions(userId);

	return (
		<ErrorBoundary>
			<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
				<header className="space-y-1">
					<h1 className="text-2xl font-bold text-[var(--foreground)]">
						Subscriptions
					</h1>
					<p className="text-sm text-[var(--muted-foreground)]">
						Channels you are subscribed to.
					</p>
				</header>

				{isLoading ? (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-20 w-full rounded-2xl" />
						))}
					</div>
				) : isError || channels.length === 0 ? (
					<EmptyState
						icon={<UsersThreeIcon size={40} />}
						title="No subscriptions yet"
						description="Subscribe to creators to see their channels here."
					/>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{channels.map((channel) => (
							<Link
								key={channel._id}
								to={`/channel/${channel.channelName}`}
								className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:bg-[var(--video-card-hover)]"
							>
								<Avatar className="h-12 w-12 shrink-0 ring-1 ring-[var(--border)]">
									<AvatarImage
										src={channel.channelAvatar}
										alt={channel.channelName}
									/>
									<AvatarFallback>
										{channel.channelName.slice(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<h2 className="truncate text-sm font-semibold text-[var(--foreground)]">
										{channel.channelName}
									</h2>
									<p className="text-xs text-[var(--muted-foreground)]">
										View channel
									</p>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</ErrorBoundary>
	);
}
