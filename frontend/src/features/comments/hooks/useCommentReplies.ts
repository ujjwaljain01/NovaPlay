import { useQuery } from '@tanstack/react-query';
import { getCommentReplies } from '../api/comment.api';
import { commentQueryKeys } from '../queries/comment.query-keys';

export function useCommentReplies(commentId: string, enabled: boolean) {
	return useQuery({
		queryKey: commentQueryKeys.replies(commentId),
		queryFn: () => getCommentReplies(commentId),
		enabled: !!commentId && enabled,
		staleTime: 1000 * 60,
	});
}
