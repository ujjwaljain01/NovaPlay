import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteComment } from '../api/comment.api';
import { commentQueryKeys } from '../queries/comment.query-keys';
import type {
	EnrichedCommentRepliesResponse,
	EnrichedCommentsResponse,
} from '../types/comment.schemas';
import {
	adjustTweetCommentsCount,
	invalidateTweetCommentCounts,
} from '@/features/tweets/utils/tweet-cache';
import { toast } from 'sonner';

export type DeleteCommentVariables =
	| string
	| { commentId: string; parentCommentId?: string; repliesCount?: number };

export function useDeleteComment(targetId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (variables: DeleteCommentVariables) => {
			const commentId =
				typeof variables === 'string' ? variables : variables.commentId;
			return deleteComment(commentId);
		},
		onSuccess: (_data, variables) => {
			const commentId =
				typeof variables === 'string' ? variables : variables.commentId;
			const parentCommentId =
				typeof variables === 'string' ? undefined : variables.parentCommentId;
			const repliesCount =
				typeof variables === 'string' ? 0 : (variables.repliesCount ?? 0);

			toast.success(parentCommentId ? 'Reply deleted' : 'Comment deleted');

			if (parentCommentId) {
				queryClient.setQueryData<EnrichedCommentRepliesResponse>(
					commentQueryKeys.replies(parentCommentId),
					(old) => {
						if (!old) return old;
						return {
							...old,
							replies: old.replies.filter((reply) => reply._id !== commentId),
						};
					},
				);
				queryClient.setQueryData<EnrichedCommentsResponse>(
					commentQueryKeys.byTarget(targetId),
					(old) => {
						if (!old) return old;
						return {
							...old,
							comments: old.comments.map((comment) => {
								if (comment._id !== parentCommentId) return comment;
								const prevCount =
									comment.repliesCount ?? comment.replyCount ?? 0;
								const nextCount = Math.max(0, prevCount - 1);
								return {
									...comment,
									replyCount: nextCount,
									repliesCount: nextCount,
								};
							}),
						};
					},
				);
				adjustTweetCommentsCount(queryClient, targetId, -1);
				queryClient.invalidateQueries({
					queryKey: commentQueryKeys.replies(parentCommentId),
				});
				queryClient.invalidateQueries({
					queryKey: commentQueryKeys.byTarget(targetId),
				});
				invalidateTweetCommentCounts(queryClient, targetId);
				return;
			}

			adjustTweetCommentsCount(queryClient, targetId, -(1 + repliesCount));
			queryClient.invalidateQueries({
				queryKey: commentQueryKeys.byTarget(targetId),
			});
			queryClient.invalidateQueries({
				queryKey: commentQueryKeys.replies(commentId),
			});
			invalidateTweetCommentCounts(queryClient, targetId);
		},
		onError: (err: Error) => {
			toast.error(err.message || 'Failed to delete comment');
		},
	});
}
