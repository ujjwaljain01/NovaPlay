import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { addComment } from '../api/comment.api';
import { commentQueryKeys } from '../queries/comment.query-keys';
import {
	adjustTweetCommentsCount,
	invalidateTweetCommentCounts,
} from '@/features/tweets/utils/tweet-cache';
import type {
	EnrichedComment,
	EnrichedCommentRepliesResponse,
	EnrichedCommentsResponse,
} from '../types/comment.schemas';

export function useAddReply(targetId: string, parentCommentId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (content: string) => addComment(parentCommentId, content),
		onSuccess: (newReply: EnrichedComment) => {
			toast.success('Reply added');

			let previousReplyCount = 0;

			if (targetId) {
				queryClient.setQueryData<EnrichedCommentsResponse>(
					commentQueryKeys.byTarget(targetId),
					(old) => {
						if (!old) return old;
						return {
							...old,
							comments: old.comments.map((comment) => {
								if (comment._id !== parentCommentId) return comment;
								previousReplyCount =
									comment.repliesCount ?? comment.replyCount ?? 0;
								const nextCount = previousReplyCount + 1;
								return {
									...comment,
									replyCount: nextCount,
									repliesCount: nextCount,
								};
							}),
						};
					},
				);
			}

			const repliesKey = commentQueryKeys.replies(parentCommentId);
			const existingReplies =
				queryClient.getQueryData<EnrichedCommentRepliesResponse>(repliesKey);

			if (existingReplies) {
				queryClient.setQueryData<EnrichedCommentRepliesResponse>(
					repliesKey,
					(old) => {
						if (!old) return old;
						return {
							...old,
							replies: [...old.replies, newReply],
						};
					},
				);
			} else if (previousReplyCount === 0) {
				queryClient.setQueryData<EnrichedCommentRepliesResponse>(repliesKey, {
					replies: [newReply],
					nextCursor: null,
					hasNextPage: false,
				});
			} else {
				queryClient.invalidateQueries({ queryKey: repliesKey });
			}

			if (targetId) {
				adjustTweetCommentsCount(queryClient, targetId, 1);
				invalidateTweetCommentCounts(queryClient, targetId);
			}
		},
		onError: (err: AxiosError<{ message?: string }>) => {
			toast.error(
				err?.response?.data?.message || err.message || 'Failed to post reply',
			);
		},
	});
}
