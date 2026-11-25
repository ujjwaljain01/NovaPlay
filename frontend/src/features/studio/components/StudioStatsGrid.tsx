import {
	ChatCircleDotsIcon,
	EyeIcon,
	HeartIcon,
	UsersIcon,
	VideoCameraIcon,
} from '@phosphor-icons/react';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { formatViews } from '@/lib/format-views';
import type { StudioStats } from '../types/studio.schemas';

interface StudioStatsGridProps {
	stats?: StudioStats;
	isLoading: boolean;
	isError: boolean;
}

export function StudioStatsGrid({
	stats,
	isLoading,
	isError,
}: StudioStatsGridProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton
						key={i}
						className="h-24 w-full rounded-2xl bg-[var(--skeleton)]"
					/>
				))}
			</div>
		);
	}

	if (isError || !stats) {
		return (
			<EmptyState
				icon={<VideoCameraIcon size={36} />}
				title="Unable to load channel stats"
				description="Please refresh or try again in a moment."
			/>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
			<StatCard
				label="Videos"
				value={stats.videos}
				icon={<VideoCameraIcon size={18} />}
			/>
			<StatCard
				label="Total Views"
				value={stats.totalViews}
				icon={<EyeIcon size={18} />}
			/>
			<StatCard
				label="Subscribers"
				value={stats.subscriberCount}
				icon={<UsersIcon size={18} />}
			/>
			<StatCard
				label="Comments"
				value={stats.totalComments}
				icon={<ChatCircleDotsIcon size={18} />}
			/>
			<StatCard
				label="Likes"
				value={stats.totalLikes}
				icon={<HeartIcon size={18} />}
			/>
		</div>
	);
}

function StatCard({
	label,
	value,
	icon,
}: {
	label: string;
	value: number;
	icon: React.ReactNode;
}) {
	return (
		<div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
			<div className="flex items-center justify-between text-[var(--muted-foreground)]">
				<span className="text-xs font-medium">{label}</span>
				{icon}
			</div>
			<p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
				{formatViews(value)}
			</p>
		</div>
	);
}
