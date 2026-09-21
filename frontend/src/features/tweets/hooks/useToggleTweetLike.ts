import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTweetLike } from '../api/tweet.api';
import { tweetQueryKeys } from '../queries/tweet.query-keys';

export function useToggleTweetLike() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (tweetId: string) => toggleTweetLike(tweetId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tweetQueryKeys.all });
		},
	});
}
