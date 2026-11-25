import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
	CaretDownIcon,
	CaretUpIcon,
	ChatCircleIcon,
	HeartIcon,
	PencilSimpleIcon,
	TrashIcon,
} from '@phosphor-icons/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { formatUploadTime } from '@/lib/format-upload-time';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/auth.store';
import { toast } from 'sonner';
import { useAddReply } from '../hooks/useAddReply';
import { useCommentReplies } from '../hooks/useCommentReplies';
import { useToggleCommentLike } from '../hooks/useToggleCommentLike';
import { useUpdateComment } from '../hooks/useUpdateComment';
import { isCommentEdited, parseLeadingMention } from '../utils/comment-helpers';
import { CommentInput } from './CommentInput';
import type { EnrichedComment } from '../types/comment.schemas';
import type { Comment } from '../types/comment.types';

type CommentLikeShape = Comment | EnrichedComment;

interface CommentItemProps {
	comment: CommentLikeShape;
	targetId?: string;
	parentCommentId?: string;
	isReply?: boolean;
	enableReplies?: boolean;
	onDelete?: (
		commentId: string,
		parentCommentId?: string,
		repliesCount?: number,
	) => void;
}

function getLikeCount(comment: CommentLikeShape): number {
	if ('likeCount' in comment && typeof comment.likeCount === 'number') {
		return comment.likeCount;
	}
	if ('likesCount' in comment && typeof comment.likesCount === 'number') {
		return comment.likesCount;
	}
	return 0;
}

function getReplyCount(comment: CommentLikeShape): number {
	if ('repliesCount' in comment && typeof comment.repliesCount === 'number') {
		return comment.repliesCount;
	}
	if ('replyCount' in comment && typeof comment.replyCount === 'number') {
		return comment.replyCount;
	}
	return 0;
}

export function CommentItem({
	comment,
	targetId = '',
	parentCommentId,
	isReply = false,
	enableReplies = true,
	onDelete,
}: CommentItemProps) {
	const { user, isAuthenticated } = useAuthStore();
	const [isEditing, setIsEditing] = useState(false);
	const [draftContent, setDraftContent] = useState(comment.content);
	const [isReplying, setIsReplying] = useState(false);
	const [showReplies, setShowReplies] = useState(false);

	const rootCommentId = parentCommentId ?? comment._id;
	const canReply = enableReplies;
	const canExpandReplies = enableReplies && !isReply;
	const initialLikeCount = getLikeCount(comment);
	const replyCount = getReplyCount(comment);
	const edited = isCommentEdited(comment);
	const { mentionUsername, mentionToken, rest } = parseLeadingMention(
		comment.content,
	);

	const { isLiked, likesCount, toggle } = useToggleCommentLike(
		comment._id,
		comment.isLiked ?? false,
		initialLikeCount,
	);
	const updateCommentMutation = useUpdateComment(targetId, parentCommentId);
	const addReplyMutation = useAddReply(targetId, rootCommentId);
	const {
		data: repliesData,
		isLoading: repliesLoading,
		isError: repliesError,
	} = useCommentReplies(comment._id, canExpandReplies && showReplies);

	const owner = comment.owner;
	const isOwner = user?._id === owner?._id;
	const avatar =
		owner?.avatar ||
		`https://api.dicebear.com/7.x/bottts/svg?seed=${owner?.username}`;
	const initials = (owner?.fullName || owner?.username || 'U')
		.split(' ')
		.map((n) => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	const handleLike = () => {
		if (!isAuthenticated) {
			toast.info('Sign in to like this comment');
			return;
		}
		toggle();
	};

	const handleToggleReply = () => {
		if (!isAuthenticated) {
			toast.info('Sign in to reply to this comment');
			return;
		}
		setIsReplying((prev) => !prev);
	};

	const handleStartEdit = () => {
		setDraftContent(comment.content);
		setIsEditing(true);
	};

	const handleSaveEdit = () => {
		const trimmed = draftContent.trim();
		if (!trimmed) {
			toast.error('Comment cannot be empty');
			return;
		}
		updateCommentMutation.mutate(
			{ commentId: comment._id, content: trimmed },
			{ onSuccess: () => setIsEditing(false) },
		);
	};

	const replies = repliesData?.replies ?? [];

	return (
		<div className={cn('group flex gap-3', isReply ? 'py-2' : 'py-3')}>
			<Link to={`/channel/${owner?.username}`} className="shrink-0">
				<Avatar
					className={cn(
						'ring-1 ring-[var(--border)] transition-transform hover:scale-105',
						isReply ? 'h-7 w-7' : 'h-9 w-9',
					)}
				>
					<AvatarImage src={avatar} alt={owner?.fullName || owner?.username} />
					<AvatarFallback className="bg-[var(--primary)]/10 text-[10px] font-semibold text-[var(--primary)]">
						{initials}
					</AvatarFallback>
				</Avatar>
			</Link>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<Link
						to={`/channel/${owner?.username}`}
						className="text-xs font-semibold text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
					>
						@{owner?.username}
					</Link>
					<span className="text-[11px] text-[var(--muted-foreground)]">
						{formatUploadTime(comment.createdAt)}
					</span>
					{edited ? (
						<span className="text-[11px] text-[var(--muted-foreground)]">
							(edited)
						</span>
					) : null}
				</div>

				{isEditing ? (
					<div className="mt-2 space-y-2">
						<Textarea
							value={draftContent}
							onChange={(e) => setDraftContent(e.target.value)}
							maxLength={320}
							rows={2}
							className="text-sm"
						/>
						<div className="flex items-center gap-2">
							<Button
								type="button"
								size="sm"
								disabled={updateCommentMutation.isPending}
								onClick={handleSaveEdit}
							>
								{updateCommentMutation.isPending ? 'Saving...' : 'Save'}
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								disabled={updateCommentMutation.isPending}
								onClick={() => setIsEditing(false)}
							>
								Cancel
							</Button>
						</div>
					</div>
				) : (
					<p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-[var(--foreground)]/90">
						{mentionUsername ? (
							<>
								<Link
									to={`/channel/${mentionUsername}`}
									className="font-medium text-[var(--primary)] hover:underline"
								>
									{mentionToken}
								</Link>
								{rest}
							</>
						) : (
							comment.content
						)}
					</p>
				)}

				<div className="-ml-2 mt-2 flex items-center gap-1">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={handleLike}
						className="h-7 gap-1 rounded-full px-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
					>
						<HeartIcon
							size={14}
							weight={isLiked ? 'fill' : 'regular'}
							className={isLiked ? 'text-[var(--destructive)]' : ''}
						/>
						{likesCount > 0 ? <span>{likesCount}</span> : null}
					</Button>

					{canReply ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleToggleReply}
							className="h-7 gap-1 rounded-full px-2.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
						>
							<ChatCircleIcon size={14} />
							<span>Reply</span>
						</Button>
					) : null}

					{isOwner ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							aria-label="Edit comment"
							onClick={handleStartEdit}
							className="h-7 rounded-full px-2 text-xs text-[var(--muted-foreground)] opacity-0 transition-opacity hover:text-[var(--foreground)] group-hover:opacity-100 focus-visible:opacity-100"
						>
							<PencilSimpleIcon size={14} />
						</Button>
					) : null}

					{isOwner && onDelete ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							aria-label="Delete comment"
							className="h-7 rounded-full px-2 text-xs text-[var(--muted-foreground)] opacity-0 transition-opacity hover:text-[var(--destructive)] group-hover:opacity-100 focus-visible:opacity-100"
							onClick={() =>
								onDelete(comment._id, parentCommentId, !isReply ? replyCount : 0)
							}
						>
							<TrashIcon size={14} />
						</Button>
					) : null}
				</div>

				{canReply && isReplying ? (
					<div className="mt-3">
						<CommentInput
							key={`${comment._id}:${owner?.username ?? ''}`}
							compact
							autoFocus
							defaultExpanded
							initialContent={
								isReply && owner?.username ? `@${owner.username} ` : ''
							}
							placeholder={`Reply to @${owner?.username ?? 'user'}...`}
							submitLabel="Reply"
							isPending={addReplyMutation.isPending}
							onSubmitContent={(content, { onSuccess }) => {
								addReplyMutation.mutate(content, {
									onSuccess: () => {
										onSuccess();
										setIsReplying(false);
										if (!isReply) {
											setShowReplies(true);
										}
									},
								});
							}}
							onCancel={() => setIsReplying(false)}
						/>
					</div>
				) : null}

				{canExpandReplies && replyCount > 0 ? (
					<div className="mt-1.5">
						<button
							type="button"
							onClick={() => setShowReplies((prev) => !prev)}
							className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
						>
							{showReplies ? (
								<>
									<CaretUpIcon size={13} />
									<span>Hide replies</span>
								</>
							) : (
								<>
									<CaretDownIcon size={13} />
									<span>
										View {replyCount}{' '}
										{replyCount === 1 ? 'reply' : 'replies'}
									</span>
								</>
							)}
						</button>

						{showReplies ? (
							<div className="mt-2 space-y-1 border-l border-[var(--border)] pl-4">
								{repliesLoading ? (
									<div className="space-y-3 py-2">
										{Array.from({ length: 2 }).map((_, i) => (
											<div key={i} className="flex gap-2.5">
												<Skeleton className="h-7 w-7 shrink-0 rounded-full" />
												<div className="flex-1 space-y-1.5">
													<Skeleton className="h-3 w-24 rounded" />
													<Skeleton className="h-3.5 w-3/4 rounded" />
												</div>
											</div>
										))}
									</div>
								) : repliesError ? (
									<p className="py-2 text-xs text-[var(--destructive)]">
										Failed to load replies.
									</p>
								) : (
									replies.map((reply) => (
										<CommentItem
											key={reply._id}
											comment={reply}
											targetId={targetId}
											parentCommentId={comment._id}
											isReply
											enableReplies={enableReplies}
											onDelete={onDelete}
										/>
									))
								)}
							</div>
						) : null}
					</div>
				) : null}
			</div>
		</div>
	);
}
