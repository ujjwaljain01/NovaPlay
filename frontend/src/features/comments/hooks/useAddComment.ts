import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { addComment } from '../api/comment.api';
import { commentQueryKeys } from '../queries/comment.query-keys';
import {
	adjustTweetCommentsCount,
	invalidateTweetCommentCounts,
} from '@/features/tweets/utils/tweet-cache';
import { toast } from 'sonner';

export function useAddComment(targetId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (content: string) => addComment(targetId, content),
		onSuccess: () => {
			toast.success('Comment added');
			adjustTweetCommentsCount(queryClient, targetId, 1);
			queryClient.invalidateQueries({ queryKey: commentQueryKeys.byTarget(targetId) });
			invalidateTweetCommentCounts(queryClient, targetId);
		},
		onError: (err: AxiosError<{ message?: string }>) => {
			toast.error(err?.response?.data?.message || err.message || 'Failed to post comment');
		},
	});
}
