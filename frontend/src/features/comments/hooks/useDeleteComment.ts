import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteComment } from '../api/comment.api';
import { commentQueryKeys } from '../queries/comment.query-keys';
import { toast } from 'sonner';

export function useDeleteComment(targetId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (commentId: string) => deleteComment(commentId),
		onSuccess: () => {
			toast.success('Comment deleted');
			queryClient.invalidateQueries({ queryKey: commentQueryKeys.byTarget(targetId) });
		},
		onError: (err: any) => {
			toast.error(err?.response?.data?.message || err.message || 'Failed to delete comment');
		},
	});
}
