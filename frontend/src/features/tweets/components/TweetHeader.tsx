import { Link } from 'react-router-dom';
import { formatUploadTime } from '@/lib/format-upload-time';
import type { TweetOwner } from '../types/tweet.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface Props {
	owner?: TweetOwner;
	createdAt: string;
}

export function TweetHeader({ owner, createdAt }: Props) {
	const fullName = owner?.fullName || 'Nova User';
	const username = owner?.username || 'user';
	const avatar = owner?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
	const initials = fullName
		.split(' ')
		.map((n) => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className="mb-3.5 flex items-start justify-between gap-3">
			<Link
				to={`/channel/${username}`}
				className="group flex items-center gap-3 min-w-0"
			>
				<Avatar className="h-10 w-10 shrink-0 ring-1 ring-border/50 transition-transform duration-200 group-hover:scale-105">
					<AvatarImage src={avatar} alt={fullName} />
					<AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
						{initials}
					</AvatarFallback>
				</Avatar>

				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
						{fullName}
					</p>
					<p className="truncate text-xs text-muted-foreground">
						@{username}
					</p>
				</div>
			</Link>

			<div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
				<span className="text-[11px]">
					{formatUploadTime(createdAt)}
				</span>
				<Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
					<DotsThreeVerticalIcon size={16} />
				</Button>
			</div>
		</div>
	);
}
