import { ChatCircleDotsIcon } from '@phosphor-icons/react';
import { useComments } from '../hooks/useComments';
import { useDeleteComment } from '../hooks/useDeleteComment';
import { CommentInput } from './CommentInput';
import { CommentItem } from './CommentItem';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentSectionProps {
	targetId: string;
}

export function CommentSection({ targetId }: CommentSectionProps) {
	const { data, isLoading } = useComments(targetId);
	const deleteCommentMutation = useDeleteComment(targetId);

	const comments = data?.comments ?? [];

	return (
		<section className="space-y-5">
			{/* Header */}
			<div className="flex items-center gap-2.5">
				<h3 className="text-lg font-bold tracking-tight text-foreground">
					{isLoading ? 'Comments' : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
				</h3>
			</div>

			{/* Composer */}
			<CommentInput targetId={targetId} />

			{/* Comments List */}
			{isLoading ? (
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
			) : comments.length > 0 ? (
				<div className="divide-y divide-border/40">
					{comments.map((comment) => (
						<CommentItem
							key={comment._id}
							comment={comment}
							onDelete={(id) => deleteCommentMutation.mutate(id)}
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
