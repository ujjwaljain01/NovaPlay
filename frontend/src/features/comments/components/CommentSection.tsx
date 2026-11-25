import { ChatCircleDotsIcon } from '@phosphor-icons/react';
import { useAuthStore } from '@/features/auth/auth.store';
import { useComments } from '../hooks/useComments';
import { useDeleteComment } from '../hooks/useDeleteComment';
import { CommentInput } from './CommentInput';
import { CommentItem } from './CommentItem';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentSectionProps {
	targetId: string;
	enableReplies?: boolean;
	totalCommentsCount?: number;
}

export function CommentSection({
	targetId,
	enableReplies = true,
	totalCommentsCount,
}: CommentSectionProps) {
	const { isAuthenticated } = useAuthStore();
	const { data, isLoading, isError } = useComments(targetId, isAuthenticated);
	const deleteCommentMutation = useDeleteComment(targetId);

	const comments = data?.comments ?? [];
	const displayCount = totalCommentsCount ?? comments.length;

	return (
		<section className="space-y-5">
			{/* Header */}
			<div className="flex items-center gap-2.5">
				<h3 className="text-lg font-bold tracking-tight text-foreground">
					{!isAuthenticated || isLoading
						? 'Comments'
						: `${displayCount} Comment${displayCount !== 1 ? 's' : ''}`}
				</h3>
			</div>

			{/* Composer */}
			<CommentInput targetId={targetId} />

			{/* Comments List */}
			{!isAuthenticated ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-10 text-center">
					<ChatCircleDotsIcon size={36} className="mb-2.5 text-muted-foreground/50" />
					<p className="text-sm font-medium text-muted-foreground">
						Sign in to view and join the comments
					</p>
				</div>
			) : isLoading ? (
				<div className="space-y-4 pt-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="flex gap-3">
							<Skeleton className="h-9 w-9 shrink-0 rounded-full" />
							<div className="flex-1 space-y-2 pt-1">
								<Skeleton className="h-3 w-32 rounded" />
								<Skeleton className="h-3.5 w-full rounded" />
								<Skeleton className="h-3.5 w-3/4 rounded" />
							</div>
						</div>
					))}
				</div>
			) : isError ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-10 text-center">
					<ChatCircleDotsIcon size={36} className="mb-2.5 text-muted-foreground/50" />
					<p className="text-sm font-medium text-muted-foreground">
						Unable to load comments right now.
					</p>
				</div>
			) : comments.length > 0 ? (
				<div className="divide-y divide-border/40">
					{comments.map((comment) => (
						<CommentItem
							key={comment._id}
							comment={comment}
							targetId={targetId}
							enableReplies={enableReplies}
							onDelete={(id, parentCommentId, repliesCount) =>
								deleteCommentMutation.mutate({
									commentId: id,
									parentCommentId,
									repliesCount,
								})
							}
						/>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-12 text-center">
					<ChatCircleDotsIcon size={40} className="text-muted-foreground/50 mb-3" />
					<p className="text-sm font-medium text-muted-foreground">No comments yet</p>
					<p className="mt-1 text-xs text-muted-foreground/70">Be the first to share your thoughts!</p>
				</div>
			)}
		</section>
	);
}
