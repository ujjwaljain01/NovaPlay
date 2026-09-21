import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addComment } from '../api/comment.api';
import { commentQueryKeys } from '../queries/comment.query-keys';
import { toast } from 'sonner';

export function useAddComment(targetId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (content: string) => addComment(targetId, content),
		onSuccess: () => {
			toast.success('Comment added');
			queryClient.invalidateQueries({ queryKey: commentQueryKeys.byTarget(targetId) });
		},
		onError: (err: any) => {
			toast.error(err?.response?.data?.message || err.message || 'Failed to post comment');
		},
	});
}
