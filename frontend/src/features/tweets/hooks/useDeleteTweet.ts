import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteTweet } from '../api/tweet.api';
import { tweetQueryKeys } from '../queries/tweet.query-keys';

export function useDeleteTweet() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (tweetId: string) => deleteTweet(tweetId),
		onSuccess: () => {
			toast.success('Tweet deleted');
			void queryClient.invalidateQueries({ queryKey: tweetQueryKeys.all });
		},
		onError: (err: Error) => {
			toast.error(err.message || 'Failed to delete tweet');
		},
	});
}
