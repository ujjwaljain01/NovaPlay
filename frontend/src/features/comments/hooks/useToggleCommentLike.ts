import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { toggleCommentLike } from '../api/comment.api';
import { commentQueryKeys } from '../queries/comment.query-keys';

export function useToggleCommentLike(
	commentId: string,
	initialLiked: boolean,
	initialCount: number,
) {
	const queryClient = useQueryClient();
	const [isLiked, setIsLiked] = useState(initialLiked);
	const [likesCount, setLikesCount] = useState(initialCount);
	const [prevSyncKey, setPrevSyncKey] = useState(
		`${commentId}:${initialLiked}:${initialCount}`,
	);

	const syncKey = `${commentId}:${initialLiked}:${initialCount}`;
	if (syncKey !== prevSyncKey) {
		setPrevSyncKey(syncKey);
		setIsLiked(initialLiked);
		setLikesCount(initialCount);
	}

	const mutation = useMutation({
		mutationFn: () => toggleCommentLike(commentId),
		onMutate: () => {
			const previousLiked = isLiked;
			const previousCount = likesCount;
			const nextLiked = !previousLiked;

			setIsLiked(nextLiked);
			setLikesCount(
				nextLiked ? previousCount + 1 : Math.max(0, previousCount - 1),
			);

			return { previousLiked, previousCount };
		},
		onError: (err, _variables, context) => {
			if (context !== undefined) {
				setIsLiked(context.previousLiked);
				setLikesCount(context.previousCount);
			}
			toast.error(err.message || 'Failed to toggle comment like');
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: commentQueryKeys.all });
		},
	});

	return {
		isLiked,
		likesCount,
		toggle: () => mutation.mutate(),
		isPending: mutation.isPending,
	};
}
