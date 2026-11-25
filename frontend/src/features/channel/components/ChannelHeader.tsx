import { Link } from 'react-router-dom';
import { CheckIcon, UserPlusIcon, VideoCameraIcon } from '@phosphor-icons/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes/route-paths';
import type { ChannelProfile } from '../types/channel.schemas';

interface ChannelHeaderProps {
	fullName: ChannelProfile['fullName'];
	username: ChannelProfile['username'];
	avatar: ChannelProfile['avatar'];
	coverImage?: ChannelProfile['coverImage'];
	subscribersCount: ChannelProfile['subscribersCount'];
	subscribedToCount: ChannelProfile['ChannelsSubscriberToCount'];
	isSubscribed: ChannelProfile['isSubscribed'];
	isOwnChannel?: boolean;
	isSubscribing?: boolean;
	onToggleSubscribe: () => void;
}

export function ChannelHeader({
	fullName,
	username,
	avatar,
	coverImage,
	subscribersCount,
	subscribedToCount,
	isSubscribed,
	isOwnChannel = false,
	isSubscribing = false,
	onToggleSubscribe,
}: ChannelHeaderProps) {
	const initials = fullName
		.split(' ')
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	return (
		<section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
			{/* Cover Banner */}
			<div className="relative h-36 w-full bg-[var(--muted)] sm:h-48 lg:h-56">
				{coverImage ? (
					<img
						src={coverImage}
						alt={`${fullName} banner`}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="h-full w-full bg-gradient-to-r from-[var(--muted)] via-[var(--accent)] to-[var(--muted)]" />
				)}
			</div>

			{/* Profile Row */}
			<div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
					<Avatar className="-mt-12 h-20 w-20 shrink-0 border-4 border-[var(--card)] ring-1 ring-[var(--border)] sm:-mt-14 sm:h-24 sm:w-24">
						<AvatarImage src={avatar} alt={fullName} />
						<AvatarFallback className="bg-[var(--primary)]/15 text-lg font-bold text-[var(--primary)]">
							{initials || 'NC'}
						</AvatarFallback>
					</Avatar>

					<div className="min-w-0 space-y-1">
						<h1 className="truncate text-xl font-bold text-[var(--foreground)] sm:text-2xl">
							{fullName}
						</h1>
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--muted-foreground)]">
							<span>@{username}</span>
							<span>•</span>
							<span>
								{subscribersCount}{' '}
								{subscribersCount === 1 ? 'subscriber' : 'subscribers'}
							</span>
							<span>•</span>
							<span>{subscribedToCount} subscribed</span>
						</div>
					</div>
				</div>

				{!isOwnChannel ? (
					<Button
						onClick={onToggleSubscribe}
						disabled={isSubscribing}
						size="sm"
						className={cn(
							'gap-1.5 rounded-full px-5 text-xs font-semibold transition-colors',
							isSubscribed
								? 'border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--accent)]'
								: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90',
						)}
					>
						{isSubscribed ? (
							<>
								<CheckIcon size={15} />
								<span>Subscribed</span>
							</>
						) : (
							<>
								<UserPlusIcon size={15} />
								<span>Subscribe</span>
							</>
						)}
					</Button>
				) : (
					<Link to={ROUTES.STUDIO_VIDEOS}>
						<Button
							size="sm"
							variant="outline"
							className="gap-1.5 rounded-full border-[var(--border)] px-5 text-xs font-semibold"
						>
							<VideoCameraIcon size={15} />
							<span>Manage Videos</span>
						</Button>
					</Link>
				)}
			</div>
		</section>
	);
}
