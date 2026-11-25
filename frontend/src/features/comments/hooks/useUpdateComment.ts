import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateComment } from '../api/comment.api';
import { commentQueryKeys } from '../queries/comment.query-keys';
import type {
	EnrichedComment,
	EnrichedCommentRepliesResponse,
	EnrichedCommentsResponse,
} from '../types/comment.schemas';

export interface UpdateCommentInput {
	commentId: string;
	content: string;
}

function patchUpdatedComment(
	item: EnrichedComment,
	updated: EnrichedComment,
): EnrichedComment {
	if (item._id !== updated._id) return item;
	return {
		...item,
		content: updated.content,
		updatedAt: updated.updatedAt,
		isEdited: updated.isEdited,
	};
}

export function useUpdateComment(targetId: string, parentCommentId?: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ commentId, content }: UpdateCommentInput) =>
			updateComment(commentId, content),
		onSuccess: (updated) => {
			toast.success('Comment updated');
			if (parentCommentId) {
				queryClient.setQueryData<EnrichedCommentRepliesResponse>(
					commentQueryKeys.replies(parentCommentId),
					(old) => {
						if (!old) return old;
						return {
							...old,
							replies: old.replies.map((reply) =>
								patchUpdatedComment(reply, updated),
							),
						};
					},
				);
				return;
			}
			if (targetId) {
				queryClient.setQueryData<EnrichedCommentsResponse>(
					commentQueryKeys.byTarget(targetId),
					(old) => {
						if (!old) return old;
						return {
							...old,
							comments: old.comments.map((comment) =>
								patchUpdatedComment(comment, updated),
							),
						};
					},
				);
			}
		},
		onError: (err) => {
			toast.error(err.message || 'Failed to update comment');
		},
		onSettled: () => {
			if (parentCommentId) {
				queryClient.invalidateQueries({
					queryKey: commentQueryKeys.replies(parentCommentId),
				});
				return;
			}
			queryClient.invalidateQueries({
				queryKey: commentQueryKeys.byTarget(targetId),
			});
		},
	});
}
