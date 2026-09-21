import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@phosphor-icons/react';
import { formatViews } from '@/lib/format-views';
import { formatUploadTime } from '@/lib/format-upload-time';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { VideoOwner } from '@/types/video.types';

interface VideoMetadataProps {
	id: string;
	title: string;
	owner?: VideoOwner | string;
	views: number;
	createdAt: string;
}

export function VideoMetadata({
	id,
	title,
	owner,
	views,
	createdAt,
}: VideoMetadataProps) {
	const ownerObj = typeof owner === 'object' && owner !== null ? owner : null;
	const fullName = ownerObj?.fullName || 'Nova Creator';
	const username = ownerObj?.username || 'creator';
	const avatarUrl = ownerObj?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
	const initials = fullName
		.split(' ')
		.map((n) => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className="mt-3 flex gap-3">
			<Link
				to={`/channel/${username}`}
				className="group shrink-0"
				onClick={(e) => e.stopPropagation()}
			>
				<Avatar className="h-9 w-9 ring-1 ring-border/50 transition-transform duration-200 group-hover:scale-105">
					<AvatarImage src={avatarUrl} alt={fullName} />
					<AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
						{initials}
					</AvatarFallback>
				</Avatar>
			</Link>

			<div className="min-w-0 flex-1">
				<Link
					to={`/watch/${id}`}
					className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-foreground transition-colors hover:text-primary"
					title={title}
				>
					{title}
				</Link>

				<div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
					<Link
						to={`/channel/${username}`}
						className="truncate transition-colors hover:text-foreground"
						onClick={(e) => e.stopPropagation()}
					>
						{fullName}
					</Link>

					{ownerObj?.isVerified && (
						<CheckCircleIcon weight="fill" size={13} className="text-primary shrink-0" />
					)}
				</div>

				<p className="mt-0.5 text-xs text-muted-foreground/90">
					{formatViews(views)} • {formatUploadTime(createdAt)}
				</p>
			</div>
		</div>
	);
}
