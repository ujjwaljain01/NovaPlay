import { useQuery } from '@tanstack/react-query';
import { getComments } from '../api/comment.api';
import { commentQueryKeys } from '../queries/comment.query-keys';

export function useComments(targetId: string, enabled = true) {
	return useQuery({
		queryKey: commentQueryKeys.byTarget(targetId),
		queryFn: () => getComments(targetId),
		enabled: !!targetId && enabled,
		staleTime: 1000 * 60,
	});
}
