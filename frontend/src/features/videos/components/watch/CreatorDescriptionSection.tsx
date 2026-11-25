import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
	CaretDownIcon,
	CaretUpIcon,
	CheckIcon,
	UserPlusIcon,
	EyeIcon,
	CalendarBlankIcon,
} from '@phosphor-icons/react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { HashtagText } from '@/components/common/HashtagText';
import { formatViews } from '@/lib/format-views';
import { formatUploadTime } from '@/lib/format-upload-time';
import type { EnrichedVideoOwner } from '../../types/video.schemas';

export interface CreatorDescriptionSectionProps {
	owner: EnrichedVideoOwner | null;
	views: number;
	createdAt: string;
	description: string;
	isSubscribed: boolean;
	isOwnChannel: boolean;
	isSubscribing?: boolean;
	onSubscribe: () => void;
}

export function CreatorDescriptionSection({
	owner,
	views,
	createdAt,
	description,
	isSubscribed,
	isOwnChannel,
	isSubscribing = false,
	onSubscribe,
}: CreatorDescriptionSectionProps) {
	const [expanded, setExpanded] = useState(false);

	const subscribersCount = owner?.subscribersCount ?? 0;
	const fullName = owner?.fullName || 'Nova Creator';
	const username = owner?.username || 'creator';
	const avatarUrl =
		owner?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
	const initials = fullName
		.split(' ')
		.filter(Boolean)
		.map((n: string) => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 p-4 transition-colors">
			<div className="flex items-center justify-between gap-3">
				<Link
					to={`/channel/${username}`}
					className="group flex min-w-0 items-center gap-3"
				>
					<Avatar className="h-11 w-11 ring-2 ring-[var(--border)] transition-transform duration-200 group-hover:scale-105">
						<AvatarImage src={avatarUrl} alt={fullName} />
						<AvatarFallback className="bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">
							{initials}
						</AvatarFallback>
					</Avatar>

					<div className="min-w-0">
						<h3 className="truncate text-sm font-bold text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
							{fullName}
						</h3>
						<p className="truncate text-xs text-[var(--muted-foreground)]">
							@{username} • {subscribersCount}{' '}
							{subscribersCount === 1 ? 'subscriber' : 'subscribers'}
						</p>
					</div>
				</Link>

				{!isOwnChannel ? (
					<Button
						onClick={onSubscribe}
						disabled={isSubscribing || !owner?._id}
						aria-pressed={isSubscribed}
						className={`gap-1.5 rounded-full px-5 text-xs font-bold transition-all ${
							isSubscribed
								? 'border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--accent)]'
								: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90'
						}`}
						size="sm"
					>
						{isSubscribed ? (
							<>
								<CheckIcon size={14} />
								<span>Subscribed</span>
							</>
						) : (
							<>
								<UserPlusIcon size={14} />
								<span>Subscribe</span>
							</>
						)}
					</Button>
				) : null}
			</div>

			<div className="mt-4">
				<div className="mb-2 flex items-center gap-3 text-xs font-semibold text-foreground">
					<span className="flex items-center gap-1">
						<EyeIcon size={13} />
						{formatViews(views)} views
					</span>
					<span className="flex items-center gap-1">
						<CalendarBlankIcon size={13} />
						{formatUploadTime(createdAt)}
					</span>
				</div>

				<div className={`relative ${expanded ? '' : 'max-h-[4.5em] overflow-hidden'}`}>
					<p className="whitespace-pre-line break-words text-sm leading-relaxed text-foreground/85">
						{description ? (
							<HashtagText text={description} />
						) : (
							'No description provided for this video.'
						)}
					</p>
					{!expanded && description.length > 150 && (
						<div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-muted/40 to-transparent" />
					)}
				</div>

				{description.length > 150 && (
					<button
						type="button"
						onClick={() => setExpanded((prev) => !prev)}
						className="mt-2 flex items-center gap-1 text-xs font-bold text-foreground transition-colors hover:text-primary"
					>
						{expanded ? (
							<>
								<span>Show less</span>
								<CaretUpIcon size={14} />
							</>
						) : (
							<>
								<span>...more</span>
								<CaretDownIcon size={14} />
							</>
						)}
					</button>
				)}
			</div>
		</div>
	);
}
