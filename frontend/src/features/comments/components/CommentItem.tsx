import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TrashIcon, HeartIcon } from '@phosphor-icons/react';
import { formatUploadTime } from '@/lib/format-upload-time';
import { useAuthStore } from '@/features/auth/auth.store';
import type { Comment } from '../types/comment.types';

interface CommentItemProps {
	comment: Comment;
	onDelete?: (commentId: string) => void;
}

export function CommentItem({ comment, onDelete }: CommentItemProps) {
	const { user } = useAuthStore();
	const owner = comment.owner;
	const isOwner = user?._id === owner?._id;
	const avatar = owner?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${owner?.username}`;
	const initials = (owner?.fullName || 'U')
		.split(' ')
		.map((n) => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className="group flex gap-3 py-3">
			<Link to={`/channel/${owner?.username}`} className="shrink-0">
				<Avatar className="h-9 w-9 ring-1 ring-border/40 transition-transform hover:scale-105">
					<AvatarImage src={avatar} alt={owner?.fullName} />
					<AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
						{initials}
					</AvatarFallback>
				</Avatar>
			</Link>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<Link
						to={`/channel/${owner?.username}`}
						className="text-xs font-semibold text-foreground transition-colors hover:text-primary"
					>
						@{owner?.username}
					</Link>
					<span className="text-[11px] text-muted-foreground">
						{formatUploadTime(comment.createdAt)}
					</span>
				</div>

				<p className="mt-1 text-sm leading-relaxed text-foreground/90 whitespace-pre-line break-words">
					{comment.content}
				</p>

				<div className="mt-2 flex items-center gap-1 -ml-2">
					<Button variant="ghost" size="sm" className="h-7 gap-1 rounded-full px-2 text-xs text-muted-foreground hover:text-foreground">
						<HeartIcon size={14} weight={comment.isLiked ? 'fill' : 'regular'} className={comment.isLiked ? 'text-rose-500' : ''} />
						{comment.likesCount ? <span>{comment.likesCount}</span> : null}
					</Button>

					{isOwner && onDelete && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 rounded-full px-2 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
							onClick={() => onDelete(comment._id)}
						>
							<TrashIcon size={14} />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
